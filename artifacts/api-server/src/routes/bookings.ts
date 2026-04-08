import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const statusFilter = req.query.status as string | undefined;

  let query = db.select().from(bookingsTable);

  if (session.role === "visitor") {
    if (statusFilter) {
      const rows = await db.select().from(bookingsTable)
        .where(and(
          eq(bookingsTable.userId, session.userId),
          eq(bookingsTable.status, statusFilter as any)
        ))
        .orderBy(desc(bookingsTable.requestedAt));
      res.json(rows);
    } else {
      const rows = await db.select().from(bookingsTable)
        .where(eq(bookingsTable.userId, session.userId))
        .orderBy(desc(bookingsTable.requestedAt));
      res.json(rows);
    }
  } else {
    if (statusFilter) {
      const rows = await db.select().from(bookingsTable)
        .where(eq(bookingsTable.status, statusFilter as any))
        .orderBy(desc(bookingsTable.requestedAt));
      res.json(rows);
    } else {
      const rows = await db.select().from(bookingsTable)
        .orderBy(desc(bookingsTable.requestedAt));
      res.json(rows);
    }
  }
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
