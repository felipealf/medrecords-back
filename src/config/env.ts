import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/medrecords?schema=public"),
  JWT_ACCESS_SECRET: z.string().min(16).default("dev_access_secret_for_tests_123456"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev_refresh_secret_for_tests_123456"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  ENCRYPTION_KEY_BASE64: z.string().min(10).default("MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
