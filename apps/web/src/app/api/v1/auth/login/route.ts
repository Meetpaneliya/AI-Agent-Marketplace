import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required" } },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT id, email, password_hash, name, role, is_seller, avatar_url FROM "users" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email.trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.is_seller,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isSeller: user.is_seller,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Login failed" } },
      { status: 500 }
    );
  }
}
