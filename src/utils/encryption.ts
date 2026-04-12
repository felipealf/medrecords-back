import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "./errors";

const key = Buffer.from(env.ENCRYPTION_KEY_BASE64, "base64");
if (key.length !== 32) {
  throw new Error("ENCRYPTION_KEY_BASE64 must decode to 32 bytes.");
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export function encryptField(value: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptField(payload: string): string {
  try {
    const raw = Buffer.from(payload, "base64");
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = raw.subarray(IV_LENGTH + 16);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
  } catch {
    throw new AppError("Failed to decrypt stored data.", 500);
  }
}
