import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthHeader } from "@/lib/server-auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const { rows } = await pool.query(
      `SELECT id, seller_id, status FROM "listings" WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: "Listing not found" } },
        { status: 404 }
      );
    }

    const existing = rows[0];
    if (existing.seller_id !== auth.userId && auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized to update this listing" } },
        { status: 403 }
      );
    }

    // Determine status: if it was PUBLISHED, modifying it moves it to pending_review for safety
    const newStatus =
      existing.status === "published" || existing.status === "PUBLISHED"
        ? "pending_review"
        : (body.status ? body.status.toLowerCase() : existing.status);

    const isSub = body.pricingModel === "subscription";

    await pool.query(
      `UPDATE "listings" 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           usage_description = COALESCE($3, usage_description),
           setup_guide = COALESCE($4, setup_guide),
           price_amount = COALESCE($5, price_amount),
           subscription_price = $6,
           status = $7,
           updated_at = NOW()
       WHERE id = $8`,
      [
        body.title?.trim() || null,
        body.description?.trim() || null,
        body.tagline?.trim() || null,
        body.setupGuide?.trim() || null,
        body.price !== undefined ? body.price : null,
        isSub ? body.price : null,
        newStatus,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        listing: {
          id,
          ...body,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err: any) {
    console.error("PUT /api/v1/agents/[id] error:", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to update listing" } },
      { status: 500 }
    );
  }
}
