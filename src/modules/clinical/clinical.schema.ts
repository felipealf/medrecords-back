import { z } from "zod";

export const clinicalUpsertSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  emergencyContactName: z.string().min(1).max(120),
  emergencyContactPhone: z.string().min(8).max(40),
  emergencyContactEmail: z.string().email().optional(),
  bloodType: z.string().min(1).max(6),
  allergies: z.string().min(1).max(1000),
  medications: z.string().min(1).max(1000),
  diseases: z.string().min(1).max(1000),
  surgeries: z.string().min(1).max(1000),
  notes: z.string().max(2000).optional()
});
