import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { verifyAuthHeader } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    const { rows } = await pool.query(
      `SELECT l.id, l.title, l.slug, l.description, l.usage_description as tagline,
              c.name as category, l.price_amount as price, l.subscription_price,
              l.total_sales as "totalSales", l.avg_rating as "avgRating",
              l.total_reviews as "totalReviews", l.status, l.featured,
              u.name as "sellerName"
       FROM "listings" l
       LEFT JOIN "categories" c ON l.category_id = c.id
       LEFT JOIN "User" u ON l.seller_id = u.id
       WHERE l.status IN ('PUBLISHED', 'published')
       ORDER BY l.created_at DESC`
    );

    const agents = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      tagline: r.tagline || r.description?.slice(0, 140),
      description: r.description,
      category: r.category || "General",
      platform: "n8n",
      price: Number(r.price),
      pricingModel: r.subscription_price ? "subscription" : "one_time",
      rating: Number(r.avgRating) || 5.0,
      reviewsCount: Number(r.totalReviews) || 0,
      salesCount: Number(r.totalSales) || 0,
      featured: Boolean(r.featured),
      seller: {
        name: r.sellerName || "Creator",
        verified: true,
      },
    }));

    return NextResponse.json({ success: true, data: { agents } });
  } catch (err: any) {
    console.error("GET /api/v1/agents error:", err);
    return NextResponse.json({ success: true, data: { agents: [] } });
  }
}

export async function POST(req: Request) {
  try {
    const auth = verifyAuthHeader(req.headers.get("authorization"));
    if (!auth) {
      return NextResponse.json(
        { success: false, error: { message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      tagline = "",
      setupGuide = "",
      requiredKeys = "",
      category = "General",
      price = 0,
      pricingModel = "one_time",
      status = "PENDING_REVIEW",
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: { message: "Title and description are required" } },
        { status: 400 }
      );
    }

    // Get or create category
    const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let catRes = await pool.query(
      `SELECT id FROM "categories" WHERE slug = $1 OR LOWER(name) = LOWER($2) LIMIT 1`,
      [catSlug, category]
    );

    let categoryId: string;
    if (catRes.rows.length === 0) {
      const newCatId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO "categories" (id, name, slug) VALUES ($1, $2, $3)`,
        [newCatId, category, catSlug || "general"]
      );
      categoryId = newCatId;
    } else {
      categoryId = catRes.rows[0].id;
    }

    // Unique slug
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseSlug) baseSlug = "agent-" + Date.now();
    let slug = baseSlug;
    let counter = 1;
    while ((await pool.query(`SELECT id FROM "listings" WHERE slug = $1`, [slug])).rows.length > 0) {
      slug = `${baseSlug}-${counter++}`;
    }

    const listingId = crypto.randomUUID();
    const isSub = pricingModel === "subscription";

    await pool.query(
      `INSERT INTO "listings" 
       (id, seller_id, title, slug, description, usage_description, setup_guide, required_api_keys,
        tags, category_id, price_amount, price_currency, subscription_price, status, current_version, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'USD', $12, $13, '1.0.0', NOW())`,
      [
        listingId,
        auth.userId,
        title.trim(),
        slug,
        description.trim(),
        tagline || description.slice(0, 140),
        setupGuide || "Follow documentation to deploy",
        JSON.stringify(requiredKeys ? requiredKeys.split(",").map((k: string) => k.trim()) : []),
        ["agent", "automation"],
        categoryId,
        price,
        isSub ? price : null,
        status === "DRAFT" ? "DRAFT" : "PENDING_REVIEW",
      ]
    );

    const created = {
      id: listingId,
      title,
      slug,
      description,
      tagline,
      setupGuide,
      requiredKeys,
      category,
      platform: "n8n",
      price: Number(price),
      pricingModel,
      totalSales: 0,
      totalViews: 0,
      avgRating: 5.0,
      totalReviews: 0,
      status: status === "DRAFT" ? "DRAFT" : "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { listing: created },
    });
  } catch (err: any) {
    console.error("POST /api/v1/agents error:", err);
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to create listing" } },
      { status: 500 }
    );
  }
}
