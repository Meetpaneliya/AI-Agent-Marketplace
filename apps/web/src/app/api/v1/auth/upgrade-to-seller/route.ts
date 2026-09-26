import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthHeader, signToken } from "@/lib/server-auth";

export async function POST(req: Request) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Please sign in." } },
        { status: 401 }
      );
    }

    const { rows } = await pool.query(
      `UPDATE "users" SET role = 'SELLER', is_seller = true, updated_at = NOW() 
       WHERE id = $1 RETURNING id, email, name, role, is_seller`,
      [auth.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    const user = rows[0];
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
        },
      },
    });
  } catch (error: any) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Upgrade failed" } },
      { status: 500 }
    );
  }
}
