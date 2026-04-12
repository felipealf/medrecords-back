import { z } from "zod";

export const publicPasswordSchema = z.object({
  password: z.string().min(8).max(128)
});

export const publicAccessSchema = z.object({
  password: z.string().min(8).max(128)
});

export const publicProfileStatusSchema = z.object({
  enabled: z.boolean()
});

export const printMaterialSchema = z.object({
  publicPassword: z.string().min(8).max(128)
});
