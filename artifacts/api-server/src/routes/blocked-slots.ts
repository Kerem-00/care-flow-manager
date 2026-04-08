import { Router, type IRouter } from "express";
import { db, blockedSlotsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/blocked-slots", requireAuth, async (req, res): Promise<void> => {
  const date = req.query.date as string | undefined;
  const ward = req.query.ward as string | undefined;

  let rows;
  if (date && ward) {
    rows = await db
      .select()
      .from(blockedSlotsTable)
      .where(and(eq(blockedSlotsTable.date, date), eq(blockedSlotsTable.ward, ward)));
  } else if (date) {
    rows = await db
      .select()
      .from(blockedSlotsTable)
      .where(eq(blockedSlotsTable.date, date));
  } else {
    rows = await db.select().from(blockedSlotsTable);
  }

  res.json(rows);
});

router.post("/blocked-slots", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const { ward, date, startTime, endTime, type, description } = req.body;

  if (!ward || !date || !startTime || !endTime || !type) {
    res.status(400).json({ error: "Missing required fields: ward, date, startTime, endTime, type" });
    return;
  }

  const validTypes = ["procedure", "family", "rest", "doctor_meeting", "infection_control"];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: "Invalid block type" });
    return;
  }

  const [slot] = await db
    .insert(blockedSlotsTable)
    .values({
      ward,
      date,
      startTime,
      endTime,
      type: type as "procedure" | "family" | "rest" | "doctor_meeting" | "infection_control",
      description: description || null,
      createdBy: session.name,
    })
    .returning();

  res.status(201).json(slot);
});

router.delete("/blocked-slots/:id", requireStaff, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  await db.delete(blockedSlotsTable).where(eq(blockedSlotsTable.id, id));
  res.status(204).end();
});

export default router;
