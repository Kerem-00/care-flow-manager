import { Request, Response, NextFunction } from "express";
import { getSession } from "../lib/session";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  (req as any).session = session;
  next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (session.role !== "staff") {
    res.status(403).json({ error: "Staff access required" });
    return;
  }
  (req as any).session = session;
  next();
}
