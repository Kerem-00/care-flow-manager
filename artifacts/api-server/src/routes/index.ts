import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import bookingsRouter from "./bookings";
import dashboardRouter from "./dashboard";
import blockedSlotsRouter from "./blocked-slots";
import patientsRouter from "./patients";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(bookingsRouter);
router.use(dashboardRouter);
router.use(blockedSlotsRouter);
router.use(patientsRouter);
router.use(messagesRouter);

export default router;
