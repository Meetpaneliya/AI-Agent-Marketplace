import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agentstore_jwt_secret_key_2026_secure";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  isSeller: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthHeader(header: string | null): TokenPayload | null {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
