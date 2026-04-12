import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { AppError } from "../utils/errors";

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
  };
};

export function requireAuth(req: AuthRequest, _: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError("Unauthorized.", 401);
  const token = header.slice("Bearer ".length);
  const decoded = verifyAccessToken(token);
  req.user = { id: decoded.sub, email: decoded.email };
  next();
}
