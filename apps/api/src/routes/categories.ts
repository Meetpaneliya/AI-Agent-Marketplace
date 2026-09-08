import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/prisma";

const FALLBACK_CATEGORIES = [
  { id: "cat-1", name: "Sales & CRM", slug: "sales-crm", icon: "💼", agentCount: 28 },
  { id: "cat-2", name: "Customer Support", slug: "customer-support", icon: "🎧", agentCount: 35 },
  { id: "cat-3", name: "Marketing & Content", slug: "marketing-content", icon: "📢", agentCount: 42 },
  { id: "cat-4", name: "Engineering & DevOps", slug: "engineering-devops", icon: "⚙️", agentCount: 19 },
  { id: "cat-5", name: "Data & Analytics", slug: "data-analytics", icon: "📊", agentCount: 24 },
  { id: "cat-6", name: "Finance & Operations", slug: "finance-ops", icon: "💳", agentCount: 16 },
  { id: "cat-7", name: "HR & Recruiting", slug: "hr-recruiting", icon: "👥", agentCount: 12 },
  { id: "cat-8", name: "Workflow Automation", slug: "workflow-automation", icon: "⚡", agentCount: 53 },
];

const FALLBACK_PLATFORMS = [
  { id: "plat-1", name: "n8n", slug: "n8n", fileType: ".json" },
  { id: "plat-2", name: "LangChain", slug: "langchain", fileType: ".py / .ts" },
  { id: "plat-3", name: "Make.com", slug: "make", fileType: ".json blueprint" },
  { id: "plat-4", name: "Flowise", slug: "flowise", fileType: ".json chatflow" },
  { id: "plat-5", name: "AutoGen", slug: "autogen", fileType: ".py" },
  { id: "plat-6", name: "CrewAI", slug: "crewai", fileType: ".py" },
  { id: "plat-7", name: "Custom API", slug: "custom-api", fileType: ".zip" },
];

export async function categoryRoutes(server: FastifyInstance) {
  // GET /v1/categories
  server.get("/categories", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }).catch(() => null);

      return reply.send({
        success: true,
        data: {
          categories: categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES,
        },
      });
    } catch {
      return reply.send({
        success: true,
        data: { categories: FALLBACK_CATEGORIES },
      });
    }
  });

  // GET /v1/platforms
  server.get("/platforms", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const platforms = await prisma.platform.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }).catch(() => null);

      return reply.send({
        success: true,
        data: {
          platforms: platforms && platforms.length > 0 ? platforms : FALLBACK_PLATFORMS,
        },
      });
    } catch {
      return reply.send({
        success: true,
        data: { platforms: FALLBACK_PLATFORMS },
      });
    }
  });
}
