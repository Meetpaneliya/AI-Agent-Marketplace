import jwt from "jsonwebtoken";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "agentstore-dev-super-secret-jwt-key-2025";

export type UserRoleType = "BUYER" | "SELLER" | "ADMIN";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRoleType | string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
