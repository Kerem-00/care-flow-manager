import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const blockedSlotsTable = pgTable("blocked_slots", {
  id: serial("id").primaryKey(),
  ward: text("ward").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  type: text("type", {
    enum: ["procedure", "family", "rest", "doctor_meeting", "infection_control"],
  }).notNull(),
  description: text("description"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BlockedSlot = typeof blockedSlotsTable.$inferSelect;
