import { pgTable, text, serial, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ward: text("ward").notNull(),
  dateOfBirth: text("date_of_birth"),
  admissionDate: text("admission_date").notNull(),
  condition: text("condition", {
    enum: ["critical", "serious", "stable", "improving", "discharged"],
  }).notNull().default("stable"),
  conditionNotes: text("condition_notes"),
  careTeam: text("care_team"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  drugName: text("drug_name").notNull(),
  purpose: text("purpose").notNull(),
  dose: text("dose"),
  frequency: text("frequency"),
  startedDate: text("started_date"),
  active: boolean("active").notNull().default(true),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clinicalUpdatesTable = pgTable("clinical_updates", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  updateType: text("update_type", {
    enum: ["condition", "procedure", "general", "test"],
  }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testResultsTable = pgTable("test_results", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  testName: text("test_name").notNull(),
  resultSummary: text("result_summary").notNull(),
  resultStatus: text("result_status", {
    enum: ["normal", "borderline", "elevated", "low", "pending"],
  }).notNull(),
  testedAt: text("tested_at").notNull(),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  ward: text("ward").notNull(),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vitalsTable = pgTable("vitals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  heartRate: integer("heart_rate"),
  systolicBp: integer("systolic_bp"),
  diastolicBp: integer("diastolic_bp"),
  oxygenSaturation: integer("oxygen_saturation"),
  temperature: numeric("temperature", { precision: 4, scale: 1 }),
  respiratoryRate: integer("respiratory_rate"),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Patient = typeof patientsTable.$inferSelect;
export type Medication = typeof medicationsTable.$inferSelect;
export type ClinicalUpdate = typeof clinicalUpdatesTable.$inferSelect;
export type TestResult = typeof testResultsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type Vitals = typeof vitalsTable.$inferSelect;
