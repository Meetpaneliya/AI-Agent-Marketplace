import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthHeader } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth) {
      return NextResponse.json({ success: true, data: { listings: [] } });
    }

    const { rows } = await pool.query(
      `SELECT l.id, l.title, l.slug, l.description, l.usage_description as tagline,
              l.setup_guide as "setupGuide", l.required_api_keys as "requiredKeys",
              c.name as category, c.slug as "categorySlug",
              l.price_amount as price, l.subscription_price,
              l.total_sales as "totalSales", l.total_views as "totalViews",
              l.avg_rating as "avgRating", l.total_reviews as "totalReviews",
              l.status, l.rejection_reason as "rejectionReason",
              l.approved_at as "approvedAt", l.current_version as "currentVersion",
              l.created_at as "createdAt", l.updated_at as "updatedAt"
       FROM "listings" l
       LEFT JOIN "categories" c ON l.category_id = c.id
       WHERE l.seller_id = $1
       ORDER BY l.updated_at DESC`,
      [auth.userId]
    );

    const listings = rows.map((r) => ({
      ...r,
      price: Number(r.price),
      pricingModel: r.subscription_price ? "subscription" : "one_time",
      platform: "n8n",
      avgRating: Number(r.avgRating) || 5.0,
      totalSales: Number(r.totalSales) || 0,
      totalViews: Number(r.totalViews) || 0,
      totalReviews: Number(r.totalReviews) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: { listings },
    });
  } catch (err: any) {
    console.error("seller/me error:", err);
    return NextResponse.json({ success: true, data: { listings: [] } });
  }
}
