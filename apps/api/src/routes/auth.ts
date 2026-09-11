import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/hash";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["BUYER", "SELLER"]).optional(),
  isSeller: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(server: FastifyInstance) {
  // POST /v1/auth/register
  server.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.issues,
          },
        });
      }

      const { email, password, name } = parsed.data;
      const targetRole = parsed.data.role || (parsed.data.isSeller ? "SELLER" : "BUYER");
      const isSeller = targetRole === "SELLER";

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      }).catch(() => null);

      if (existingUser) {
        return reply.status(409).send({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email address already exists",
          },
        });
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role: targetRole as any,
          isSeller,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSeller: user.isSeller,
          },
          token,
        },
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Registration failed, please try again",
        },
      });
    }
  });

  // POST /v1/auth/login
  server.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email or password format",
          },
        });
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      }).catch(() => null);

      if (!user || !user.passwordHash) {
        return reply.status(401).send({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return reply.status(401).send({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSeller: user.isSeller,
          },
          token,
        },
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Login failed, please try again",
        },
      });
    }
  });

  // GET /v1/auth/me
  server.get("/me", { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.userId;
    if (!userId) return reply.status(401).send({ success: false, error: { message: "Unauthorized" } });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSeller: true,
        sellerVerified: true,
        sellerTier: true,
        createdAt: true,
      },
    }).catch(() => null);

    if (!user) {
      return reply.send({
        success: true,
        data: {
          user: {
            id: userId,
            email: request.user?.email,
            name: "Demo User",
            role: request.user?.role,
            isSeller: request.user?.role === "seller",
          },
        },
      });
    }

    return reply.send({
      success: true,
      data: { user },
    });
  });

  // POST /v1/auth/forgot-password
  server.post("/forgot-password", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: {
        message: "If an account exists with this email, password reset instructions have been sent.",
      },
    });
  });

  // POST /v1/auth/upgrade-to-seller
  server.post("/upgrade-to-seller", { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ success: false, error: { message: "Unauthorized" } });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: "SELLER" as any,
          isSeller: true,
        },
      });

      const token = signToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            isSeller: updatedUser.isSeller,
          },
          token,
        },
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to upgrade account to seller" },
      });
    }
  });
}
