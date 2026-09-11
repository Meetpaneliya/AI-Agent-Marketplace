import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

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
    status: "published",
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
    status: "published",
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
    status: "published",
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
  title: z.string().min(5),
  tagline: z.string().min(10),
  description: z.string().min(20),
  category: z.string(),
  platform: z.string(),
  price: z.number().nonnegative(),
  pricingModel: z.enum(["free", "one_time", "subscription"]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  setupTimeMinutes: z.number().optional(),
});

export async function agentRoutes(server: FastifyInstance) {
  // GET /v1/agents
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

    let agents = [...SAMPLE_AGENTS];

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

  // GET /v1/agents/:slug
  server.get("/agents/:slug", async (request: FastifyRequest, reply: FastifyReply) => {
    const { slug } = request.params as { slug: string };
    const agent = SAMPLE_AGENTS.find((a) => a.slug === slug) || SAMPLE_AGENTS[0];

    return reply.send({
      success: true,
      data: { agent },
    });
  });

  // POST /v1/agents
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
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newListing = {
      id: "agent-" + Date.now(),
      ...data,
      slug,
      sellerId: request.user?.userId,
      status: "pending_review",
      createdAt: new Date(),
    };

    return reply.status(201).send({
      success: true,
      data: { listing: newListing },
    });
  });
}
