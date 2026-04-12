import { Router } from "express";
import { authRouter } from "./modules/auth/auth.router";
import { clinicalRouter } from "./modules/clinical/clinical.router";
import { healthRouter } from "./modules/health/health.router";
import { publicRouter } from "./modules/public/public.router";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/clinical", clinicalRouter);
apiRouter.use("/public", publicRouter);
