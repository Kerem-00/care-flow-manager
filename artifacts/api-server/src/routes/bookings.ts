import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable, patientsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function parseVisitorCount(notes: string | null | undefined): number {
  if (!notes) return 1;
  const m = notes.match(/[Vv]isitors?:?\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const statusFilter = req.query.status as string | undefined;

  // Staff: see all bookings
  if (session.role === "staff") {
    const rows = statusFilter
      ? await db.select().from(bookingsTable).where(eq(bookingsTable.status, statusFilter as any)).orderBy(desc(bookingsTable.requestedAt))
      : await db.select().from(bookingsTable).orderBy(desc(bookingsTable.requestedAt));
    res.json(rows);
    return;
  }

  // Family and visitor: see only their own bookings
  const rows = statusFilter
    ? await db.select().from(bookingsTable)
        .where(and(eq(bookingsTable.userId, session.userId), eq(bookingsTable.status, statusFilter as any)))
        .orderBy(desc(bookingsTable.requestedAt))
    : await db.select().from(bookingsTable)
        .where(eq(bookingsTable.userId, session.userId))
        .orderBy(desc(bookingsTable.requestedAt));
  res.json(rows);
});

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const { visitDate, visitTime, durationMinutes, patientName, ward, notes } = req.body;

  if (!visitDate || !visitTime || !durationMinutes || !patientName) {
    res.status(400).json({ error: "Missing required booking fields" });
    return;
  }

  if (![30, 60, 90].includes(Number(durationMinutes))) {
    res.status(400).json({ error: "Duration must be 30, 60, or 90 minutes" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    userId: session.userId,
    visitorName: session.name,
    visitorEmail: session.email,
    visitDate,
    visitTime,
    durationMinutes: Number(durationMinutes),
    patientName,
    ward: ward || null,
    notes: notes || null,
  }).returning();

  res.status(201).json(booking);
});

router.get("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (session.role === "visitor" && booking.userId !== session.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(booking);
});

router.patch("/bookings/:id/approve", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (!req.body?.force) {
    const sameDay = await db.select().from(bookingsTable).where(
      and(
        eq(bookingsTable.patientName, existing.patientName),
        eq(bookingsTable.visitDate, existing.visitDate),
        eq(bookingsTable.status, "approved"),
      )
    );

    const newStart = timeToMin(existing.visitTime);
    const newEnd = newStart + existing.durationMinutes;

    const overlapping = sameDay.filter(b => {
      const s = timeToMin(b.visitTime);
      const e = s + b.durationMinutes;
      return newStart < e && s < newEnd;
    });

    const alreadyApproved = overlapping.reduce((sum, b) => sum + parseVisitorCount(b.notes), 0);
    const incoming = parseVisitorCount(existing.notes);

    if (alreadyApproved + incoming > 2) {
      res.status(409).json({
        error: "visitor_overlap",
        totalVisitors: alreadyApproved + incoming,
        incoming,
        alreadyApproved,
        overlapping,
      });
      return;
    }
  }

  const instructions = req.body?.instructions || null;

  const [booking] = await db.update(bookingsTable)
    .set({ status: "approved", reviewedAt: new Date(), reviewedBy: session.name, staffInstructions: instructions })
    .where(eq(bookingsTable.id, id))
    .returning();

  res.json(booking);
});

router.patch("/bookings/:id/reject", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const reason = req.body?.reason || null;

  const [booking] = await db.update(bookingsTable)
    .set({ status: "rejected", rejectionReason: reason, reviewedAt: new Date(), reviewedBy: session.name })
    .where(eq(bookingsTable.id, id))
    .returning();

  res.json(booking);
});

router.patch("/bookings/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (session.role === "visitor" && existing.userId !== session.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const [booking] = await db.update(bookingsTable)
    .set({ status: "cancelled", reviewedAt: new Date(), reviewedBy: session.name })
    .where(eq(bookingsTable.id, id))
    .returning();

  res.json(booking);
});

export default router;
