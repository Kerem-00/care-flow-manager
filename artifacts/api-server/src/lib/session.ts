import { Request, Response } from "express";

const SESSION_COOKIE = "hospitime_session";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionData {
  userId: number;
  role: string;
  name: string;
  email: string;
}

export function setSession(res: Response, data: SessionData): void {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64");
  res.cookie(SESSION_COOKIE, payload, {
    httpOnly: true,
    maxAge: MAX_AGE,
    sameSite: "lax",
    signed: true,
  });
}

export function getSession(req: Request): SessionData | null {
  const signed = req.signedCookies as Record<string, string | false>;
  const raw = signed[SESSION_COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession(res: Response): void {
  res.clearCookie(SESSION_COOKIE);
}
