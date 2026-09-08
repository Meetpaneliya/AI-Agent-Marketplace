import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth";
import { categoryRoutes } from "./routes/categories";
import { agentRoutes } from "./routes/agents";

dotenv.config({ path: "../../.env" });
dotenv.config(); // Also read local .env if present

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

// ─── Health Check ───
server.get("/v1/health", async () => {
  return {
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        api: "online",
        database: "connected",
      },
    },
  };
});

// ─── Error Handling ───
server.setErrorHandler((error: any, request, reply) => {
  server.log.error(error);
  return reply.status(error.statusCode || 500).send({
    success: false,
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
    },
  });
});

server.setNotFoundHandler((request, reply) => {
  return reply.status(404).send({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${request.method} ${request.url} not found`,
    },
  });
});

// ─── Graceful Shutdown ───
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    await server.close();
    process.exit(0);
  });
}

// ─── Start Server ───
const start = async () => {
  try {
    // ─── Plugins ───
    await server.register(cors, {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    });

    await server.register(helmet, {
      contentSecurityPolicy: false,
    });

    // Rate limiting (100 requests per minute per IP)
    await server.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      errorResponseBuilder: () => ({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
        },
      }),
    });

    // ─── Routes ───
    server.register(authRoutes, { prefix: "/v1/auth" });
    server.register(categoryRoutes, { prefix: "/v1" });
    server.register(agentRoutes, { prefix: "/v1" });

    const port = parseInt(process.env.PORT || "4000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });
    server.log.info(`🚀 AgentStore API running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;
