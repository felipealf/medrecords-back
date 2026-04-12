import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/errors";
import { getClinicalProfile } from "../clinical/clinical.service";

export async function setPublicPassword(userId: string, password: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { publicAccessPasswordHash: await bcrypt.hash(password, 10) }
  });
}

export async function setPublicStatus(userId: string, enabled: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { publicProfileEnabled: enabled }
  });
}

export async function getPublicLink(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicProfileSlug: true, publicProfileEnabled: true, publicAccessPasswordHash: true }
  });
  if (!user) throw new AppError("User not found.", 404);
  if (!user.publicAccessPasswordHash) throw new AppError("Public password not configured.", 422);
  return {
    slug: user.publicProfileSlug,
    enabled: user.publicProfileEnabled,
    publicUrl: `${env.PUBLIC_BASE_URL}/public/${user.publicProfileSlug}`
  };
}

export async function getPublicQr(userId: string) {
  const data = await getPublicLink(userId);
  const qrSvg = await QRCode.toString(data.publicUrl, { type: "svg", margin: 1, width: 280 });
  return { ...data, qrSvg };
}

export async function getPrintQr(userId: string) {
  const data = await getPublicLink(userId);
  const qrSvg = await QRCode.toString(data.publicUrl, { type: "svg", margin: 1, width: 300 });
  return {
    title: "MedRecords QR Code",
    publicUrl: data.publicUrl,
    qrSvg
  };
}

export async function getPrintPassword(userId: string, publicPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicProfileSlug: true, publicAccessPasswordHash: true }
  });
  if (!user || !user.publicAccessPasswordHash) throw new AppError("Public password not configured.", 422);
  const isValid = await bcrypt.compare(publicPassword, user.publicAccessPasswordHash);
  if (!isValid) throw new AppError("Public password does not match.", 401);
  return {
    title: "MedRecords Public Access Password",
    publicUrl: `${env.PUBLIC_BASE_URL}/public/${user.publicProfileSlug}`,
    publicPassword
  };
}

export async function accessPublicProfile(slug: string, password: string, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { publicProfileSlug: slug },
    select: { id: true, publicProfileEnabled: true, publicAccessPasswordHash: true }
  });

  if (!user || !user.publicProfileEnabled || !user.publicAccessPasswordHash) {
    await prisma.publicAccessAttempt.create({
      data: { slug, ipAddress, success: false }
    });
    throw new AppError("Public profile not found.", 404);
  }

  const validPassword = await bcrypt.compare(password, user.publicAccessPasswordHash);
  if (!validPassword) {
    await prisma.publicAccessAttempt.create({
      data: { slug, ipAddress, success: false }
    });
    throw new AppError("Invalid public access password.", 401);
  }

  const clinical = await getClinicalProfile(user.id);
  await prisma.publicAccessAttempt.create({
    data: { slug, ipAddress, success: true }
  });
  return clinical;
}
