import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import bookingsRouter from "./bookings";
import dashboardRouter from "./dashboard";
import blockedSlotsRouter from "./blocked-slots";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(bookingsRouter);
router.use(dashboardRouter);
router.use(blockedSlotsRouter);

export default router;
