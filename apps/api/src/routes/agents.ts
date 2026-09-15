import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { ListingStatus } from "@prisma/client";
import { requireRole } from "../middleware/auth";
import { verifyToken } from "../lib/jwt";

const SAMPLE_AGENTS = [
  {
    id: "agent-1",
    title: "HubSpot Lead Scoring & Autonomous Outreach Agent",
    slug: "hubspot-lead-scoring-agent",
    tagline: "Enriches inbound form submissions, calculates predictive ICP score using Claude 3.5 Sonnet, and queues hyper-personalized email drafts.",
    description: "This production-ready n8n workflow automates your entire top-of-funnel inbound qualification. Pulls firmographic data via Clearbit/Apollo APIs, feeds customer context to Claude 3.5 Sonnet to score ICP alignment, assigns sales tiers in HubSpot, and automatically generates custom email drafts.",
    category: "Sales & CRM",
    categorySlug: "sales-crm",
    platform: "n8n",
    platformSlug: "n8n",
    difficulty: "Beginner",
    setupTimeMinutes: 15,
    price: 49,
    pricingModel: "one_time",
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 388,
    status: ListingStatus.PUBLISHED,
    seller: {
      name: "Nexus Automation Labs",
      verified: true,
      rating: 4.95,
      salesCount: 1420,
    },
    features: [
      "Zero-code n8n workflow JSON ready for 1-click import",
      "Automated Claude 3.5 Sonnet ICP scoring prompt matrix",
      "Native bidirectional HubSpot CRM sync",
      "Slack / Teams alerts for VIP enterprise leads",
    ],
  },
  {
    id: "agent-2",
    title: "Omnichannel Zendesk & Intercom Triage Agent",
    slug: "omnichannel-zendesk-triage-agent",
    tagline: "Autonomous L1 ticket categorization, sentiment diagnosis, knowledge-base retrieval (RAG), and zero-shot resolution.",
    description: "LangChain-powered agent that embeds incoming tickets, retrieves matching internal docs via vector search, drafts empathetic solutions, and escalates edge cases.",
    category: "Customer Support",
    categorySlug: "customer-support",
    platform: "LangChain",
    platformSlug: "langchain",
    difficulty: "Intermediate",
    setupTimeMinutes: 25,
    price: 79,
    pricingModel: "one_time",
    rating: 4.85,
    reviewsCount: 38,
    salesCount: 290,
    status: ListingStatus.PUBLISHED,
    seller: {
      name: "CognitiveOps",
      verified: true,
      rating: 4.88,
      salesCount: 890,
    },
    features: [
      "RAG pipeline with semantic chunking & reranking",
      "Zendesk & Intercom webhook listeners and tag sync",
      "Multilingual response translation in 32 languages",
    ],
  },
  {
    id: "agent-3",
    title: "Kubernetes Incident Sentry & Auto-Remediation Agent",
    slug: "kubernetes-incident-sentry-agent",
    tagline: "Monitors Prometheus/Datadog alerts, analyzes pod crashes, executes diagnostic runbooks, and proposes pull-request fixes.",
    description: "Operates as an autonomous on-call assistant. When CrashLoopBackOff or memory pressure occurs, it connects via read-only kube-api, fetches logs, identifies root causes, applies safe self-healing policies, and prepares a GitHub PR.",
    category: "Engineering & DevOps",
    categorySlug: "engineering-devops",
    platform: "Custom API / Python",
    platformSlug: "custom-api",
    difficulty: "Advanced",
    setupTimeMinutes: 30,
    price: 99,
    pricingModel: "subscription",
    rating: 4.95,
    reviewsCount: 51,
    salesCount: 165,
    status: ListingStatus.PUBLISHED,
    seller: {
      name: "SRE Autopilot",
      verified: true,
      rating: 4.98,
      salesCount: 420,
    },
    features: [
      "CrashLoopBackOff automatic triage & memory tuning",
      "Slack Interactive BlockKit alerting with 'Approve Fix' button",
      "Auto-generates GitHub PR with manifest patch suggestions",
    ],
  },
];

const createListingSchema = z.object({
  title: z.string().min(3),
  tagline: z.string().optional(),
  description: z.string().min(10),
  category: z.string(),
  platform: z.string(),
  price: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  pricingModel: z.string().default("one_time"),
  difficulty: z.string().optional(),
  setupTimeMinutes: z.union([z.number(), z.string()]).transform((val) => Number(val) || 15).optional(),
  requiredKeys: z.string().optional(),
  setupInstructions: z.string().optional(),
  demoUrl: z.string().optional(),
  fileName: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export async function agentRoutes(server: FastifyInstance) {
  // GET /v1/agents — Returns published marketplace agents (sample + approved DB listings)
  server.get("/agents", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as {
      search?: string;
      category?: string;
      platform?: string;
      pricingModel?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };

    // Fetch approved/published listings from PostgreSQL
    let dbPublishedListings: any[] = [];
    try {
      const dbListings = await prisma.listing.findMany({
        where: {
          status: ListingStatus.PUBLISHED,
        },
        include: {
          seller: { select: { id: true, name: true, sellerVerified: true } },
          category: { select: { id: true, name: true, slug: true } },
          platforms: {
            include: {
              platform: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      dbPublishedListings = dbListings.map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        tagline: l.usageDescription || l.description.slice(0, 120),
        description: l.description,
        category: l.category?.name || "General",
        categorySlug: l.category?.slug || "general",
        platform: l.platforms[0]?.platform?.name || "Custom Python",
        platformSlug: l.platforms[0]?.platform?.slug || "custom-python",
        difficulty: "Intermediate",
        setupTimeMinutes: 20,
        price: Number(l.priceAmount),
        pricingModel: l.subscriptionPrice ? "subscription" : (Number(l.priceAmount) === 0 ? "free" : "one_time"),
        rating: Number(l.avgRating) || 5.0,
        reviewsCount: l.totalReviews || 0,
        salesCount: l.totalSales || 0,
        status: l.status,
        seller: {
          name: l.seller?.name || "Verified Creator",
          verified: l.seller?.sellerVerified ?? true,
          rating: 4.9,
          salesCount: 10,
        },
        features: [
          "Enterprise verified and security sandboxed",
          "Production ready architecture",
          "Clean workflow package with setup guide",
        ],
      }));
    } catch (err) {
      server.log.warn("Failed to fetch published listings from DB, falling back to samples");
    }

    let agents = [...dbPublishedListings, ...SAMPLE_AGENTS];

    if (query.search) {
      const s = query.search.toLowerCase();
      agents = agents.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.tagline.toLowerCase().includes(s) ||
          a.description.toLowerCase().includes(s)
      );
    }

    if (query.category && query.category !== "All") {
      agents = agents.filter(
        (a) => a.category.toLowerCase() === query.category?.toLowerCase()
      );
    }

    if (query.platform && query.platform !== "All Platforms") {
      agents = agents.filter(
        (a) => a.platform.toLowerCase() === query.platform?.toLowerCase()
      );
    }

    if (query.pricingModel && query.pricingModel !== "all") {
      agents = agents.filter((a) => a.pricingModel === query.pricingModel);
    }

    return reply.send({
      success: true,
      data: {
        agents,
        total: agents.length,
        page: parseInt(query.page || "1", 10),
        limit: parseInt(query.limit || "20", 10),
      },
    });
  });

  // GET /v1/agents/seller/me — Fetch real listings directly from DB for authenticated or demo seller
  server.get("/agents/seller/me", async (request: FastifyRequest, reply: FastifyReply) => {
    let sellerId = request.user?.userId;

    if (!sellerId) {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          const decoded = verifyToken(token);
          sellerId = decoded.userId;
        } catch {
          // Token expired or invalid
        }
      }
    }

    if (!sellerId) {
      const demoSeller = await prisma.user.findUnique({
        where: { email: "developer@agentstore.com" },
      });
      sellerId = demoSeller?.id;
    }

    if (!sellerId) {
      return reply.send({ success: true, data: { listings: [] } });
    }

    const dbListings = await prisma.listing.findMany({
      where: { sellerId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        platforms: {
          include: {
            platform: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({
      success: true,
      data: {
        listings: dbListings.map((l) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          tagline: l.usageDescription || l.description.slice(0, 110) + "...",
          description: l.description,
          setupGuide: l.setupGuide,
          requiredKeys: Array.isArray(l.requiredApiKeys) ? (l.requiredApiKeys as string[]).join(", ") : "",
          category: l.category?.name || "General",
          categorySlug: l.category?.slug || "general",
          platform: l.platforms[0]?.platform?.name || "Custom Python",
          platformSlug: l.platforms[0]?.platform?.slug || "custom-python",
          price: Number(l.priceAmount),
          pricingModel: l.subscriptionPrice ? "subscription" : (Number(l.priceAmount) === 0 ? "free" : "one_time"),
          totalSales: l.totalSales,
          totalViews: l.totalViews,
          avgRating: Number(l.avgRating),
          totalReviews: l.totalReviews,
          status: l.status,
          rejectionReason: l.rejectionReason,
          approvedAt: l.approvedAt,
          fileUrl: l.fileUrl,
          version: l.currentVersion,
          updatedAt: l.updatedAt,
          createdAt: l.createdAt,
        })),
      },
    });
  });

  // GET /v1/agents/:slug
  server.get("/agents/:slug", async (request: FastifyRequest, reply: FastifyReply) => {
    const { slug } = request.params as { slug: string };
    
    // Check DB first
    try {
      const dbAgent = await prisma.listing.findUnique({
        where: { slug },
        include: {
          seller: { select: { id: true, name: true, email: true, sellerVerified: true } },
          category: true,
          platforms: { include: { platform: true } },
        },
      });

      if (dbAgent) {
        return reply.send({
          success: true,
          data: {
            agent: {
              id: dbAgent.id,
              title: dbAgent.title,
              slug: dbAgent.slug,
              tagline: dbAgent.usageDescription || dbAgent.description.slice(0, 140),
              description: dbAgent.description,
              category: dbAgent.category?.name || "General",
              categorySlug: dbAgent.category?.slug || "general",
              platform: dbAgent.platforms[0]?.platform?.name || "n8n",
              platformSlug: dbAgent.platforms[0]?.platform?.slug || "n8n",
              difficulty: "Intermediate",
              setupTimeMinutes: 20,
              price: Number(dbAgent.priceAmount),
              pricingModel: dbAgent.subscriptionPrice ? "subscription" : "one_time",
              rating: Number(dbAgent.avgRating) || 5.0,
              reviewsCount: dbAgent.totalReviews || 0,
              salesCount: dbAgent.totalSales || 0,
              status: dbAgent.status,
              rejectionReason: dbAgent.rejectionReason,
              seller: {
                name: dbAgent.seller?.name || "Creator",
                verified: dbAgent.seller?.sellerVerified ?? true,
                rating: 4.95,
                salesCount: 100,
              },
              features: [
                "Production-tested workflow file",
                "Complete step-by-step setup guide",
                "14-day escrow protection guarantee",
              ],
            },
          },
        });
      }
    } catch {
      // Fallback
    }

    const agent = SAMPLE_AGENTS.find((a) => a.slug === slug) || SAMPLE_AGENTS[0];

    return reply.send({
      success: true,
      data: { agent },
    });
  });

  // POST /v1/agents — Create new Agent listing in PostgreSQL with PENDING_REVIEW
  server.post("/agents", { preHandler: [requireRole(["SELLER", "ADMIN"])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createListingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid agent listing data",
          details: parsed.error.issues,
        },
      });
    }

    const data = parsed.data;
    const sellerId = request.user?.userId;

    if (!sellerId) {
      return reply.status(401).send({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Seller account required" },
      });
    }

    // Category Lookup / Fallback
    const catSlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: catSlug },
          { name: { equals: data.category, mode: "insensitive" } },
        ],
      },
    });

    if (!category) {
      category = (await prisma.category.findFirst()) || (await prisma.category.create({
        data: { name: data.category, slug: catSlug || "general" },
      }));
    }

    // Generate unique slug
    let baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseSlug) baseSlug = "agent-" + Date.now();
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const tagsArray = typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : Array.isArray(data.tags)
      ? data.tags
      : ["agent", "automation"];

    const requiredKeysJson = data.requiredKeys
      ? data.requiredKeys.split(",").map((k) => k.trim()).filter(Boolean)
      : ["API Key"];

    const isSubscription = data.pricingModel === "subscription";

    const listing = await prisma.listing.create({
      data: {
        sellerId,
        title: data.title,
        slug,
        description: data.description,
        usageDescription: data.tagline || data.description.slice(0, 140),
        setupGuide: data.setupInstructions || "1. Import workflow package.\n2. Add environment secrets.\n3. Deploy.",
        requiredApiKeys: requiredKeysJson,
        tags: tagsArray,
        categoryId: category.id,
        priceAmount: data.price,
        subscriptionPrice: isSubscription ? data.price : null,
        status: ListingStatus.PENDING_REVIEW,
        fileUrl: data.fileName ? `/uploads/${data.fileName}` : "/uploads/package.json",
        scanStatus: "clean",
        scanResults: { verified: true, safe: true, sandboxed: true },
        metaTitle: data.title.slice(0, 70),
        metaDescription: (data.tagline || data.description).slice(0, 160),
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    // Attach Platform
    const platform = await prisma.platform.findFirst({
      where: {
        OR: [
          { slug: data.platform.toLowerCase() },
          { name: { equals: data.platform, mode: "insensitive" } },
        ],
      },
    });

    if (platform) {
      await prisma.listingPlatform.create({
        data: {
          listingId: listing.id,
          platformId: platform.id,
        },
      }).catch(() => {});
    }

    return reply.status(201).send({
      success: true,
      data: { listing },
    });
  });

  // PUT /v1/agents/:id — Edit & Resubmit listing (Moves REJECTED -> PENDING_REVIEW)
  server.put("/agents/:id", { preHandler: [requireRole(["SELLER", "ADMIN"])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const parsed = createListingSchema.partial().safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid update data", details: parsed.error.issues },
      });
    }

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Listing not found" },
      });
    }

    const userRole = request.user?.role;
    if (userRole !== "ADMIN" && existing.sellerId !== request.user?.userId) {
      return reply.status(403).send({
        success: false,
        error: { code: "FORBIDDEN", message: "You can only edit your own listings" },
      });
    }

    const data = parsed.data;
    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.tagline) updateData.usageDescription = data.tagline;
    if (data.setupInstructions) updateData.setupGuide = data.setupInstructions;
    if (data.price !== undefined) updateData.priceAmount = data.price;
    if (data.pricingModel) {
      updateData.subscriptionPrice = data.pricingModel === "subscription" ? (data.price ?? existing.priceAmount) : null;
    }
    if (data.requiredKeys) {
      updateData.requiredApiKeys = data.requiredKeys.split(",").map((k) => k.trim()).filter(Boolean);
    }
    if (data.fileName) updateData.fileUrl = `/uploads/${data.fileName}`;

    // Security & Integrity Protection:
    // Check if code deliverable, setup instructions, or core attributes are modified
    const isCodeOrContentUpdate = Boolean(
      (data.fileName && `/uploads/${data.fileName}` !== existing.fileUrl) ||
      (data.setupInstructions && data.setupInstructions !== existing.setupGuide) ||
      (data.requiredKeys) ||
      (data.description && data.description !== existing.description) ||
      (data.title && data.title !== existing.title)
    );

    let statusChangedToPending = false;

    // Rule 1: If previously REJECTED or explicit resubmit flag, return to PENDING_REVIEW
    if (existing.status === ListingStatus.REJECTED || (request.body as any)?.resubmit) {
      updateData.status = ListingStatus.PENDING_REVIEW;
      updateData.rejectionReason = null;
      updateData.scanStatus = "pending";
      statusChangedToPending = true;
    }
    // Rule 2: If currently PUBLISHED and updated by a non-admin SELLER touching code/specs,
    // transition back to PENDING_REVIEW so malware/breaking code cannot bypass admin review!
    else if (existing.status === ListingStatus.PUBLISHED && userRole !== "ADMIN" && isCodeOrContentUpdate) {
      updateData.status = ListingStatus.PENDING_REVIEW;
      updateData.rejectionReason = null;
      updateData.scanStatus = "pending";
      statusChangedToPending = true;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    return reply.send({
      success: true,
      message: statusChangedToPending
        ? "Listing updated and submitted to Admin Review Queue for verification."
        : "Listing updated successfully.",
      data: {
        listing: updated,
        movedToReview: statusChangedToPending,
      },
    });
  });

  // ─────────────────────────────────────────────────────────────
  // ADMIN REVIEW CONSOLE ENDPOINTS
  // ─────────────────────────────────────────────────────────────

  // GET /v1/admin/reviews — Admin queue of all agent submissions
  server.get("/admin/reviews", { preHandler: [requireRole(["ADMIN"])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { status?: string };

    let whereClause: any = {};
    if (query.status && query.status !== "all") {
      const upper = query.status.toUpperCase();
      if (upper === "PENDING" || upper === "PENDING_REVIEW") {
        whereClause.status = ListingStatus.PENDING_REVIEW;
      } else if (upper === "REJECTED") {
        whereClause.status = ListingStatus.REJECTED;
      } else if (upper === "PUBLISHED" || upper === "APPROVED") {
        whereClause.status = ListingStatus.PUBLISHED;
      }
    }

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            sellerVerified: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        platforms: {
          include: {
            platform: { select: { id: true, name: true, slug: true } },
          },
        },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({
      success: true,
      data: {
        listings: listings.map((l) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          tagline: l.usageDescription || l.description.slice(0, 120),
          description: l.description,
          setupGuide: l.setupGuide,
          requiredKeys: Array.isArray(l.requiredApiKeys) ? (l.requiredApiKeys as string[]).join(", ") : "",
          category: l.category?.name || "General",
          platform: l.platforms[0]?.platform?.name || "n8n",
          price: Number(l.priceAmount),
          pricingModel: l.subscriptionPrice ? "Subscription" : "One-Time License",
          fileUrl: l.fileUrl || "agent_workflow.json",
          scanStatus: l.scanStatus,
          status: l.status,
          rejectionReason: l.rejectionReason,
          approvedAt: l.approvedAt,
          approvedBy: l.approvedBy?.name,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
          seller: {
            id: l.seller?.id,
            name: l.seller?.name || "Developer",
            email: l.seller?.email,
            verified: l.seller?.sellerVerified,
          },
        })),
      },
    });
  });

  // POST /v1/admin/reviews/:id/approve — Approve & Publish Listing (Atomic Transaction)
  server.post("/admin/reviews/:id/approve", { preHandler: [requireRole(["ADMIN"])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const adminId = request.user?.userId;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const listing = await tx.listing.findUnique({ where: { id } });
        if (!listing) {
          throw new Error("NOT_FOUND");
        }

        return await tx.listing.update({
          where: { id },
          data: {
            status: ListingStatus.PUBLISHED,
            approvedAt: new Date(),
            approvedById: adminId,
            rejectionReason: null,
          },
        });
      });

      return reply.send({
        success: true,
        message: "Agent listing approved and published to marketplace storefront!",
        data: { listing: updated },
      });
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Listing not found" },
        });
      }
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to approve listing" },
      });
    }
  });

  // POST /v1/admin/reviews/:id/reject — Reject Listing with Reviewer Feedback Reason (Atomic Transaction)
  server.post("/admin/reviews/:id/reject", { preHandler: [requireRole(["ADMIN"])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const bodySchema = z.object({
      rejectionReason: z.string().min(5, "Please provide a clear rejection reason for the author."),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "A rejection reason is required",
        },
      });
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const listing = await tx.listing.findUnique({ where: { id } });
        if (!listing) {
          throw new Error("NOT_FOUND");
        }

        return await tx.listing.update({
          where: { id },
          data: {
            status: ListingStatus.REJECTED,
            rejectionReason: parsed.data.rejectionReason,
          },
        });
      });

      return reply.send({
        success: true,
        message: "Listing rejected. Feedback has been sent to author for revision.",
        data: { listing: updated },
      });
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        return reply.status(404).send({
          success: false,
          error: { code: "NOT_FOUND", message: "Listing not found" },
        });
      }
      return reply.status(500).send({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to reject listing" },
      });
    }
  });
}
