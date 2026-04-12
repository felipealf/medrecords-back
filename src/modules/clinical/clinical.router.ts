import { Router } from "express";
import { requireAuth, type AuthRequest } from "../../middlewares/auth";
import { clinicalUpsertSchema } from "./clinical.schema";
import { getClinicalProfile, upsertClinicalProfile } from "./clinical.service";

export const clinicalRouter = Router();

clinicalRouter.use(requireAuth);

clinicalRouter.get("/me", async (req: AuthRequest, res, next) => {
  try {
    const profile = await getClinicalProfile(req.user!.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

clinicalRouter.put("/me", async (req: AuthRequest, res, next) => {
  try {
    const payload = clinicalUpsertSchema.parse(req.body);
    const result = await upsertClinicalProfile(req.user!.id, payload);
    res.json({ message: "Clinical profile saved.", ...result });
  } catch (error) {
    next(error);
  }
});
