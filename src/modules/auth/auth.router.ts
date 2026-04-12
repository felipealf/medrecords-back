import { Router } from "express";
import { requireAuth, type AuthRequest } from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rate-limiters";
import { deleteAccountSchema, loginSchema, refreshSchema, registerSchema } from "./auth.schema";
import { deleteOwnAccount, loginUser, logoutSession, refreshSession, registerUser } from "./auth.service";

export const authRouter = Router();

authRouter.post("/register", authLimiter, async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const tokens = await registerUser(payload);
    res.status(201).json({
      message: "User registered successfully.",
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const tokens = await loginUser(payload);
    res.json({ message: "Login successful.", ...tokens });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", authLimiter, async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = await refreshSession(refreshToken);
    res.json({ message: "Session refreshed.", ...tokens });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await logoutSession(refreshToken);
    res.json({ message: "Logged out." });
  } catch (error) {
    next(error);
  }
});

authRouter.delete("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { password } = deleteAccountSchema.parse(req.body);
    await deleteOwnAccount(req.user!.id, password);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
