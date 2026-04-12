import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/errors";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens";
import { slugFromEmail } from "../../utils/slug";

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function tokenExpiryDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }]
    }
  });
  if (existing) throw new AppError("Email or username already in use.", 409);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 10),
      publicProfileSlug: slugFromEmail(input.email)
    }
  });

  return issueTokens(user.id, user.email);
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw new AppError("Invalid credentials.", 401);
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError("Invalid credentials.", 401);
  if (user.deletedAt) throw new AppError("Account is unavailable.", 403);

  return issueTokens(user.id, user.email);
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const hashed = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: hashed,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
  if (!stored) throw new AppError("Invalid refresh token.", 401);

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() }
  });

  return issueTokens(payload.sub, payload.email);
}

export async function logoutSession(refreshToken: string) {
  const hashed = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashed, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function deleteOwnAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid credentials.", 401);

  await prisma.user.delete({ where: { id: user.id } });
}

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId, email });
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: tokenExpiryDate(7)
    }
  });
  return { accessToken, refreshToken };
}
