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
    const { rejectionReason = "Changes requested by Admin" } = await req.json();

    await pool.query(
      `UPDATE "listings" 
       SET status = 'REJECTED', rejection_reason = $1, updated_at = NOW() 
       WHERE id = $2`,
      [rejectionReason, id]
    );

    return NextResponse.json({ success: true, message: "Listing rejected with feedback" });
  } catch (err: any) {
    console.error("Reject error:", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to reject listing" } },
      { status: 500 }
    );
  }
}
