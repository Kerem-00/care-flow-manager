import { Router, type IRouter } from "express";
import { db, bookingsTable } from "@workspace/db";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { requireAuth, requireStaff } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/visitor-stats", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;

  const rows = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.userId, session.userId));

  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    rejected: rows.filter(r => r.status === "rejected").length,
    cancelled: rows.filter(r => r.status === "cancelled").length,
    upcomingVisits: rows.filter(r => r.status === "approved" && r.visitDate >= today).length,
  };

  res.json(stats);
});

router.get("/dashboard/staff-stats", requireStaff, async (req, res): Promise<void> => {
  const allBookings = await db.select().from(bookingsTable);

  const today = new Date().toISOString().split("T")[0];

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const uniqueVisitors = new Set(allBookings.map(b => b.userId));

  const approvedToday = allBookings.filter(b =>
    b.status === "approved" && b.visitDate === today
  ).length;

  const approvedThisWeek = allBookings.filter(b =>
    b.status === "approved" && b.reviewedAt && b.reviewedAt >= startOfWeek
  ).length;

  const rejectedThisWeek = allBookings.filter(b =>
    b.status === "rejected" && b.reviewedAt && b.reviewedAt >= startOfWeek
  ).length;

  res.json({
    totalRequests: allBookings.length,
    pendingRequests: allBookings.filter(b => b.status === "pending").length,
    approvedToday,
    totalVisitors: uniqueVisitors.size,
    approvedThisWeek,
    rejectedThisWeek,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const session = (req as any).session;

  let rows;
  if (session.role === "staff") {
    rows = await db.select().from(bookingsTable)
      .orderBy(sql`${bookingsTable.requestedAt} desc`)
      .limit(20);
  } else {
    rows = await db.select().from(bookingsTable)
      .where(eq(bookingsTable.userId, session.userId))
      .orderBy(sql`${bookingsTable.requestedAt} desc`)
      .limit(10);
  }

  const activity = rows.map(b => ({
    id: b.id,
    action: b.status === "pending" ? "Visit requested" :
            b.status === "approved" ? "Visit approved" :
            b.status === "rejected" ? "Visit declined" :
            "Visit cancelled",
    visitorName: b.visitorName,
    visitDate: b.visitDate,
    status: b.status,
    timestamp: b.status === "pending" ? b.requestedAt : (b.reviewedAt || b.requestedAt),
  }));

  res.json(activity);
});

export default router;
