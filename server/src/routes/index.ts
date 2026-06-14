import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appsRouter from "./apps";
import authRouter from "./auth";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appsRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(analyticsRouter);

export default router;
