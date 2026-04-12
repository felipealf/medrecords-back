import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function notFoundHandler(_: Request, res: Response) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(
  error: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
  }

  return res.status(500).json({ message: "Internal server error." });
}
