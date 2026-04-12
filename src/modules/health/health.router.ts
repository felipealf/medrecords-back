import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
