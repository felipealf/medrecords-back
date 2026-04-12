import { Router } from "express";
import { requireAuth, type AuthRequest } from "../../middlewares/auth";
import { publicAccessLimiter } from "../../middlewares/rate-limiters";
import { printMaterialSchema, publicAccessSchema, publicPasswordSchema, publicProfileStatusSchema } from "./public.schema";
import {
  accessPublicProfile,
  getPrintPassword,
  getPrintQr,
  getPublicLink,
  getPublicQr,
  setPublicPassword,
  setPublicStatus
} from "./public.service";

export const publicRouter = Router();

publicRouter.post("/:slug/access", publicAccessLimiter, async (req, res, next) => {
  try {
    const { password } = publicAccessSchema.parse(req.body);
    const slug = String(req.params.slug);
    const data = await accessPublicProfile(slug, password, req.ip);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

publicRouter.use(requireAuth);

publicRouter.put("/password", async (req: AuthRequest, res, next) => {
  try {
    const { password } = publicPasswordSchema.parse(req.body);
    await setPublicPassword(req.user!.id, password);
    res.json({ message: "Public access password updated." });
  } catch (error) {
    next(error);
  }
});

publicRouter.put("/status", async (req: AuthRequest, res, next) => {
  try {
    const { enabled } = publicProfileStatusSchema.parse(req.body);
    await setPublicStatus(req.user!.id, enabled);
    res.json({ message: "Public profile status updated.", enabled });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/link", async (req: AuthRequest, res, next) => {
  try {
    const data = await getPublicLink(req.user!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/qr", async (req: AuthRequest, res, next) => {
  try {
    const data = await getPublicQr(req.user!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/print/qr", async (req: AuthRequest, res, next) => {
  try {
    const data = await getPrintQr(req.user!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

publicRouter.post("/print/password", async (req: AuthRequest, res, next) => {
  try {
    const { publicPassword } = printMaterialSchema.parse(req.body);
    const data = await getPrintPassword(req.user!.id, publicPassword);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
