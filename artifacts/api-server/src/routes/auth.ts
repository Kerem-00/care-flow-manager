import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { setSession, getSession, clearSession } from "../lib/session";

const router: IRouter = Router();

const STAFF_CODE = "HOSP2024";

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, role, staffCode } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!["visitor", "family", "staff"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  if (role === "staff" && staffCode !== STAFF_CODE) {
    res.status(400).json({ error: "Invalid staff code" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: role as "visitor" | "family" | "staff",
  }).returning();

  setSession(res, { userId: user.id, role: user.role, name: user.name, email: user.email });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle ?? null, createdAt: user.createdAt },
    message: "Account created successfully",
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  setSession(res, { userId: user.id, role: user.role, name: user.name, email: user.email });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle ?? null, createdAt: user.createdAt },
    message: "Login successful",
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  clearSession(res);
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
  if (!user) {
    clearSession(res);
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, jobTitle: user.jobTitle ?? null, createdAt: user.createdAt });
});

export default router;
