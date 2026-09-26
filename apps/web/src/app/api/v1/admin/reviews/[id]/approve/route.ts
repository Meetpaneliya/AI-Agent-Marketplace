import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthHeader } from "@/lib/server-auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { id } = await params;

    await pool.query(
      `UPDATE "listings" 
       SET status = 'published', approved_at = NOW(), rejection_reason = NULL, updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, message: "Listing approved and published successfully" });
  } catch (err: any) {
    console.error("Approve error:", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to approve listing" } },
      { status: 500 }
    );
  }
}
