import { Router, type IRouter } from "express";
import { db, patientsTable, medicationsTable, clinicalUpdatesTable, testResultsTable, vitalsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();
const rawParam = (v: string | string[]): string => Array.isArray(v) ? v[0] : v;

// GET /patients — staff sees all; family sees only their linked patient
router.get("/patients", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;

  if (session.role === "staff") {
    const rows = await db.select().from(patientsTable).orderBy(desc(patientsTable.updatedAt));
    res.json(rows);
    return;
  }

  const [userRow] = await db.select({ linkedPatientId: usersTable.linkedPatientId })
    .from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);

  if (!userRow?.linkedPatientId) {
    res.json([]);
    return;
  }

  const [patient] = await db.select().from(patientsTable)
    .where(eq(patientsTable.id, userRow.linkedPatientId)).limit(1);

  res.json(patient ? [patient] : []);
});

// GET /patients/search — name+ward only, accessible to all authenticated users (for booking form autocomplete)
router.get("/patients/search", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select({ id: patientsTable.id, name: patientsTable.name, ward: patientsTable.ward })
    .from(patientsTable)
    .orderBy(patientsTable.name);
  res.json(rows);
});

// GET /patients/:id — staff or linked family only
router.get("/patients/:id", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const id = parseInt(rawParam(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  if (session.role !== "staff") {
    const [userRow] = await db.select({ linkedPatientId: usersTable.linkedPatientId })
      .from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (userRow?.linkedPatientId !== id) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }

  const [medications, updates, testResults] = await Promise.all([
    db.select().from(medicationsTable).where(eq(medicationsTable.patientId, id)).orderBy(desc(medicationsTable.createdAt)),
    db.select().from(clinicalUpdatesTable).where(eq(clinicalUpdatesTable.patientId, id)).orderBy(desc(clinicalUpdatesTable.createdAt)),
    db.select().from(testResultsTable).where(eq(testResultsTable.patientId, id)).orderBy(desc(testResultsTable.createdAt)),
  ]);

  res.json({ patient, medications, updates, testResults });
});

// POST /patients — register a new patient (staff only)
router.post("/patients", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const { name, ward, dateOfBirth, admissionDate, condition, conditionNotes, careTeam } = req.body;

  if (!name || !ward || !admissionDate) {
    res.status(400).json({ error: "name, ward and admissionDate are required" });
    return;
  }

  const [patient] = await db.insert(patientsTable).values({
    name,
    ward,
    dateOfBirth: dateOfBirth || null,
    admissionDate,
    condition: condition || "stable",
    conditionNotes: conditionNotes || null,
    careTeam: careTeam || null,
    createdBy: session.name,
  }).returning();

  res.status(201).json(patient);
});

// PATCH /patients/:id — update patient condition/notes (staff only)
router.patch("/patients/:id", requireStaff, async (req, res): Promise<void> => {
  const id = parseInt(rawParam(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { condition, conditionNotes, careTeam, ward } = req.body;

  const [patient] = await db.update(patientsTable)
    .set({
      ...(condition && { condition }),
      ...(conditionNotes !== undefined && { conditionNotes }),
      ...(careTeam !== undefined && { careTeam }),
      ...(ward && { ward }),
      updatedAt: new Date(),
    })
    .where(eq(patientsTable.id, id))
    .returning();

  if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
  res.json(patient);
});

// POST /patients/:id/link-family — link a visitor account to this patient (staff only)
router.post("/patients/:id/link-family", requireStaff, async (req, res): Promise<void> => {
  const id = parseInt(rawParam(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "email is required" }); return; }

  const [user] = await db.select().from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
  if (!user) { res.status(404).json({ error: "No account found with that email" }); return; }
  if (user.role === "staff") { res.status(400).json({ error: "Cannot link a staff account" }); return; }

  await db.update(usersTable).set({ linkedPatientId: id }).where(eq(usersTable.id, user.id));
  res.json({ success: true, userId: user.id, userName: user.name, userEmail: user.email });
});

// DELETE /patients/:id/link-family/:userId — unlink a family member (staff only)
router.delete("/patients/:id/link-family/:userId", requireStaff, async (req, res): Promise<void> => {
  const userId = parseInt(rawParam(req.params.userId), 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  await db.update(usersTable).set({ linkedPatientId: null }).where(eq(usersTable.id, userId));
  res.status(204).end();
});

// GET /patients/:id/family — get linked family members (staff only)
router.get("/patients/:id/family", requireStaff, async (req, res): Promise<void> => {
  const id = parseInt(rawParam(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid patient ID" }); return; }
  const members = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.linkedPatientId, id));
  res.json(members);
});

// POST /patients/:id/medications — add a medication (staff only)
router.post("/patients/:id/medications", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { drugName, purpose, dose, frequency, startedDate } = req.body;
  if (!drugName || !purpose) {
    res.status(400).json({ error: "drugName and purpose are required" });
    return;
  }

  const [med] = await db.insert(medicationsTable).values({
    patientId,
    drugName,
    purpose,
    dose: dose || null,
    frequency: frequency || null,
    startedDate: startedDate || null,
    addedBy: session.name,
  }).returning();

  res.status(201).json(med);
});

// DELETE /patients/:id/medications/:medId — remove a medication (staff only)
router.delete("/patients/:id/medications/:medId", requireStaff, async (req, res): Promise<void> => {
  const medId = parseInt(rawParam(req.params.medId), 10);
  if (isNaN(medId)) { res.status(400).json({ error: "Invalid medication ID" }); return; }
  await db.delete(medicationsTable).where(eq(medicationsTable.id, medId));
  res.status(204).end();
});

// POST /patients/:id/updates — post a clinical update (staff only)
router.post("/patients/:id/updates", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { updateType, title, content } = req.body;
  if (!updateType || !title || !content) {
    res.status(400).json({ error: "updateType, title and content are required" });
    return;
  }

  const [update] = await db.insert(clinicalUpdatesTable).values({
    patientId,
    updateType,
    title,
    content,
    updatedBy: session.name,
  }).returning();

  res.status(201).json(update);
});

// POST /patients/:id/test-results — add a test result (staff only)
router.post("/patients/:id/test-results", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { testName, resultSummary, resultStatus, testedAt } = req.body;
  if (!testName || !resultSummary || !resultStatus || !testedAt) {
    res.status(400).json({ error: "testName, resultSummary, resultStatus and testedAt are required" });
    return;
  }

  const [result] = await db.insert(testResultsTable).values({
    patientId,
    testName,
    resultSummary,
    resultStatus,
    testedAt,
    addedBy: session.name,
  }).returning();

  res.status(201).json(result);
});

// GET /patients/:id/vitals/history — last 20 vitals readings
router.get("/patients/:id/vitals/history", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  if (session.role !== "staff") {
    const [userRow] = await db.select({ linkedPatientId: usersTable.linkedPatientId })
      .from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (userRow?.linkedPatientId !== patientId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  const rows = await db.select().from(vitalsTable)
    .where(eq(vitalsTable.patientId, patientId))
    .orderBy(desc(vitalsTable.recordedAt))
    .limit(20);

  res.json(rows.reverse());
});

// GET /patients/:id/vitals — latest vitals (auth, access-checked)
router.get("/patients/:id/vitals", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  if (session.role !== "staff") {
    const [userRow] = await db.select({ linkedPatientId: usersTable.linkedPatientId })
      .from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (userRow?.linkedPatientId !== patientId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  const [latest] = await db.select().from(vitalsTable)
    .where(eq(vitalsTable.patientId, patientId))
    .orderBy(desc(vitalsTable.recordedAt))
    .limit(1);

  res.json(latest ?? null);
});

// POST /patients/:id/vitals — record new vitals (staff only)
router.post("/patients/:id/vitals", requireStaff, async (req, res): Promise<void> => {
  const session = (req as any).session;
  const patientId = parseInt(rawParam(req.params.id), 10);
  if (isNaN(patientId)) { res.status(400).json({ error: "Invalid patient ID" }); return; }

  const { heartRate, systolicBp, diastolicBp, oxygenSaturation, temperature, respiratoryRate } = req.body;

  const [vitals] = await db.insert(vitalsTable).values({
    patientId,
    heartRate: heartRate ?? null,
    systolicBp: systolicBp ?? null,
    diastolicBp: diastolicBp ?? null,
    oxygenSaturation: oxygenSaturation ?? null,
    temperature: temperature ?? null,
    respiratoryRate: respiratoryRate ?? null,
    recordedBy: session.name,
  }).returning();

  res.status(201).json(vitals);
});

export default router;
