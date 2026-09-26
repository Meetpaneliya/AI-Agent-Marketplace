import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthHeader } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = `
      SELECT l.id, l.title, l.slug, l.description, l.usage_description as tagline,
             l.setup_guide as "setupGuide", l.required_api_keys as "requiredKeys",
             c.name as category, c.slug as "categorySlug",
             l.price_amount as price, l.subscription_price,
             l.total_sales as "totalSales", l.total_views as "totalViews",
             l.avg_rating as "avgRating", l.total_reviews as "totalReviews",
             l.status, l.rejection_reason as "rejectionReason",
             l.approved_at as "approvedAt", l.current_version as "currentVersion",
             l.created_at as "createdAt", l.updated_at as "updatedAt",
             u.id as "sellerId", u.name as "sellerName", u.email as "sellerEmail",
             u.seller_verified as "sellerVerified"
      FROM "listings" l
      LEFT JOIN "categories" c ON l.category_id = c.id
      LEFT JOIN "users" u ON l.seller_id = u.id
    `;

    const params: any[] = [];
    if (status && status !== "all") {
      query += ` WHERE l.status = $1`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY l.updated_at DESC`;

    const { rows } = await pool.query(query, params);

    const listings = rows.map((r) => ({
      ...r,
      price: Number(r.price),
      pricingModel: r.subscription_price ? "subscription" : "one_time",
      platform: "n8n",
      avgRating: Number(r.avgRating) || 5.0,
      totalSales: Number(r.totalSales) || 0,
      totalViews: Number(r.totalViews) || 0,
      totalReviews: Number(r.totalReviews) || 0,
      seller: {
        id: r.sellerId,
        name: r.sellerName || "Creator",
        email: r.sellerEmail || "",
        verified: Boolean(r.sellerVerified),
      },
    }));

    return NextResponse.json({
      success: true,
      data: { listings },
    });
  } catch (err: any) {
    console.error("GET /api/v1/admin/reviews error:", err);
    return NextResponse.json({ success: true, data: { listings: [] } });
  }
}
