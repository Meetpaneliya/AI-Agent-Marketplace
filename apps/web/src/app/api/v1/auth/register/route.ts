import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import { signToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, role = "BUYER", isSeller = false } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: { message: "Name, email, and password are required" } },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await pool.query(
      `SELECT id FROM "users" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: { message: "An account with this email already exists" } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const assignedRole = role === "SELLER" || isSeller ? "SELLER" : "BUYER";
    const userIsSeller = assignedRole === "SELLER";

    await pool.query(
      `INSERT INTO "users" (id, email, password_hash, name, role, is_seller, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, email.trim(), passwordHash, name.trim(), assignedRole, userIsSeller]
    );

    const token = signToken({
      userId,
      email: email.trim(),
      role: assignedRole,
      isSeller: userIsSeller,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email: email.trim(),
          name: name.trim(),
          role: assignedRole,
          isSeller: userIsSeller,
        },
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Registration failed" } },
      { status: 500 }
    );
  }
}
