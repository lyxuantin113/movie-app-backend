import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// jsonwebtoken: default import cho runtime, type-only cho types
import jwt from "jsonwebtoken";
import type { SignOptions, Secret, JwtPayload } from "jsonwebtoken";

import { z } from "zod";

const router = Router();

const RegisterDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((v) => v ?? null),
});
const LoginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- JWT helpers (gõ kiểu rõ ràng) ---
// Secret
const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "") as Secret;

// Kiểu expiresIn KHÔNG cho phép undefined
type Expires = NonNullable<SignOptions["expiresIn"]>;

function parseExpires(val: string | undefined, fallback: Expires): Expires {
  if (!val || val.trim() === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? (n as Expires) : (val as Expires); // số giây hoặc "15m"/"7d"...
}

const ACCESS_EXPIRES: Expires = parseExpires(process.env.JWT_EXPIRES_IN, "15m");
const REFRESH_EXPIRES: Expires = parseExpires(
  process.env.JWT_REFRESH_EXPIRES_IN,
  "7d"
);

const ACCESS_OPTS: SignOptions = { expiresIn: ACCESS_EXPIRES };
const REFRESH_OPTS: SignOptions = { expiresIn: REFRESH_EXPIRES };

export function signTokens(payload: object) {
  const accessToken = jwt.sign(payload, JWT_SECRET, ACCESS_OPTS);
  const refreshToken = jwt.sign(payload, JWT_SECRET, REFRESH_OPTS);
  return { accessToken, refreshToken };
}

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
) {
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false, // Đặt true khi deploy HTTPS
  };
  res.cookie("access_token", tokens.accessToken, {
    ...common,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", tokens.refreshToken, {
    ...common,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// --- Routes ---
router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const { email, password, name } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hash, name },
  });

  const tokens = signTokens({ sub: user.id, email: user.email });
  setAuthCookies(res, tokens);
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.format());

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const tokens = signTokens({ sub: user.id, email: user.email });
  setAuthCookies(res, tokens);
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ ok: true });
});

router.post("/refresh", (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: "No refresh token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    const sub = typeof payload === "string" ? undefined : payload.sub;
    const email =
      typeof payload === "string" ? undefined : (payload as any).email;

    if (!sub) return res.status(401).json({ message: "Invalid refresh token" });

    const tokens = signTokens({ sub, email });
    setAuthCookies(res, tokens);
    res.json({ ok: true });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/me", (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ message: "Unauthenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    const sub = typeof payload === "string" ? undefined : payload.sub;
    const email =
      typeof payload === "string" ? undefined : (payload as any).email;
    if (!sub) return res.status(401).json({ message: "Invalid token" });
    res.json({ id: sub, email });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
