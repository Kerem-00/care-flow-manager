import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable, patientsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();
const rawParam = (v: string | string[]): string => Array.isArray(v) ? v[0] : v;

// GET /messages/threads — all patient threads with latest message (staff inbox)
router.get("/messages/threads", requireStaff, async (req, res): Promise<void> => {
  // Get the latest message per patientName+ward thread
  const rows = await db.execute(sql`
    SELECT DISTINCT ON ("patient_name", "ward")
      "patient_name" as "patientName",
      "ward",
      "content",
      "sender_name" as "senderName",
      "sender_role" as "senderRole",
      "created_at" as "createdAt",
      (SELECT COUNT(*) FROM "messages" m2
       WHERE m2."patient_name" = "messages"."patient_name"
         AND m2."ward" = "messages"."ward") as "total",
      (SELECT COUNT(*) FROM "messages" m3
       WHERE m3."patient_name" = "messages"."patient_name"
         AND m3."ward" = "messages"."ward"
         AND m3."sender_role" = 'family'
         AND m3."read_at" IS NULL) as "unreadFromFamily"
    FROM "messages"
    ORDER BY "patient_name", "ward", "created_at" DESC
  `);
  res.json(rows.rows);
});

// GET /messages/unread-count — unread count for current user
// For staff: count of unread family/visitor messages
// For family: count of unread staff messages addressed to their patient
router.get("/messages/unread-count", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;

  if (session.role === "staff") {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM "messages"
      WHERE "sender_role" != 'staff' AND "read_at" IS NULL
    `);
    const count = Number((result.rows[0] as any)?.count ?? 0);
    res.json({ count });
    return;
  }

  if (session.role === "family") {
    const [userRow] = await db.select({ linkedPatientId: usersTable.linkedPatientId })
      .from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!userRow?.linkedPatientId) { res.json({ count: 0 }); return; }
    const [patient] = await db.select({ name: patientsTable.name, ward: patientsTable.ward })
      .from(patientsTable).where(eq(patientsTable.id, userRow.linkedPatientId)).limit(1);
    if (!patient) { res.json({ count: 0 }); return; }
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM "messages"
      WHERE "patient_name" = ${patient.name}
        AND "ward" = ${patient.ward}
        AND "sender_role" = 'staff'
        AND "read_at" IS NULL
    `);
    const count = Number((result.rows[0] as any)?.count ?? 0);
    res.json({ count });
    return;
  }

  res.json({ count: 0 });
});

// PATCH /messages/mark-staff-read — family marks all staff messages in their thread as read (clears unread badge)
router.patch("/messages/mark-staff-read", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const { patientName, ward } = req.body;
  if (!patientName || !ward) { res.status(400).json({ error: "patientName and ward are required" }); return; }
  await db.update(messagesTable)
    .set({ readAt: new Date() })
    .where(and(
      eq(messagesTable.patientName, patientName),
      eq(messagesTable.ward, ward),
      eq(messagesTable.senderRole, "staff"),
    ));
  res.status(204).end();
});

// PATCH /messages/:id/read — mark message as read (staff only)
router.patch("/messages/:id/read", requireStaff, async (req, res): Promise<void> => {
  const id = parseInt(rawParam(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid message ID" }); return; }
  await db.update(messagesTable).set({ readAt: new Date() }).where(eq(messagesTable.id, id));
  res.status(204).end();
});

// PATCH /messages/read-thread — mark all messages in a thread as read (staff only)
router.patch("/messages/read-thread", requireStaff, async (req, res): Promise<void> => {
  const { patientName, ward } = req.body;
  if (!patientName || !ward) { res.status(400).json({ error: "patientName and ward are required" }); return; }
  await db.update(messagesTable)
    .set({ readAt: new Date() })
    .where(and(
      eq(messagesTable.patientName, patientName),
      eq(messagesTable.ward, ward),
      eq(messagesTable.senderRole, "family"),
    ));
  res.status(204).end();
});

// GET /messages?patientName=&ward= — get thread for a patient/ward
router.get("/messages", requireAuth, async (req, res): Promise<void> => {
  const { patientName, ward } = req.query as { patientName?: string; ward?: string };

  if (!patientName || !ward) {
    res.status(400).json({ error: "patientName and ward query params are required" });
    return;
  }

  const rows = await db.select().from(messagesTable)
    .where(and(
      eq(messagesTable.patientName, patientName),
      eq(messagesTable.ward, ward),
    ))
    .orderBy(desc(messagesTable.createdAt));

  res.json(rows);
});

// POST /messages — send a message
router.post("/messages", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const { patientName, ward, content } = req.body;

  if (!patientName || !ward || !content?.trim()) {
    res.status(400).json({ error: "patientName, ward and content are required" });
    return;
  }

  const [message] = await db.insert(messagesTable).values({
    patientName,
    ward,
    senderId: session.userId,
    senderName: session.name,
    senderRole: session.role,
    content: content.trim(),
  }).returning();

  res.status(201).json(message);
});

export default router;
