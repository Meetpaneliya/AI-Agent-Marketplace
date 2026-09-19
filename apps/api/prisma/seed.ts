import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Sales & CRM", slug: "sales-crm", icon: "💼", sortOrder: 1 },
  { name: "Customer Support", slug: "customer-support", icon: "🎧", sortOrder: 2 },
  { name: "Data Scraping", slug: "data-scraping", icon: "🔍", sortOrder: 3 },
  { name: "Content Generation", slug: "content-generation", icon: "✍️", sortOrder: 4 },
  { name: "Marketing Automation", slug: "marketing-automation", icon: "📈", sortOrder: 5 },
  { name: "Developer Tools", slug: "developer-tools", icon: "🛠️", sortOrder: 6 },
  { name: "Finance & Accounting", slug: "finance-accounting", icon: "💰", sortOrder: 7 },
  { name: "HR & Recruitment", slug: "hr-recruitment", icon: "👥", sortOrder: 8 },
  { name: "Social Media", slug: "social-media", icon: "📱", sortOrder: 9 },
  { name: "Other", slug: "other", icon: "📦", sortOrder: 10 },
];

const platforms = [
  { name: "n8n", slug: "n8n" },
  { name: "Make", slug: "make" },
  { name: "Zapier", slug: "zapier" },
  { name: "LangChain", slug: "langchain" },
  { name: "AutoGen", slug: "autogen" },
  { name: "CrewAI", slug: "crewai" },
  { name: "Custom Python", slug: "custom-python" },
  { name: "Custom JavaScript", slug: "custom-javascript" },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Categories ───
  console.log("📁 Creating categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`   ✅ ${categories.length} categories created\n`);

  // ─── Platforms ───
  console.log("🔧 Creating platforms...");
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: {},
      create: platform,
    });
  }
  console.log(`   ✅ ${platforms.length} platforms created\n`);

  // ─── Super Admin ───
  console.log("👑 Creating super admin account...");
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@agentstore.com" },
    update: {
      role: "ADMIN" as any,
      passwordHash: adminHash,
    },
    create: {
      email: "admin@agentstore.com",
      passwordHash: adminHash,
      name: "AgentStore Admin",
      role: "ADMIN" as any,
      emailVerified: true,
    },
  });
  console.log("   ✅ Super admin created (admin@agentstore.com / admin123)\n");

  // ─── Demo Seller ───
  console.log("⚡ Creating demo seller account...");
  const sellerHash = await bcrypt.hash("SuperPassword123", 10);
  await prisma.user.upsert({
    where: { email: "developer@agentstore.com" },
    update: {
      role: "SELLER" as any,
      isSeller: true,
      passwordHash: sellerHash,
    },
    create: {
      email: "developer@agentstore.com",
      passwordHash: sellerHash,
      name: "Nexus Automation Labs (Seller)",
      role: "SELLER" as any,
      isSeller: true,
      sellerVerified: true,
      emailVerified: true,
    },
  });
  console.log("   ✅ Demo seller created (developer@agentstore.com / SuperPassword123)\n");

  // ─── Demo Buyer ───
  console.log("🛒 Creating demo buyer account...");
  const buyerHash = await bcrypt.hash("SuperPassword123", 10);
  await prisma.user.upsert({
    where: { email: "buyer@agentstore.com" },
    update: {
      role: "BUYER" as any,
      isSeller: false,
      passwordHash: buyerHash,
    },
    create: {
      email: "buyer@agentstore.com",
      passwordHash: buyerHash,
      name: "Amit Patel (Buyer)",
      role: "BUYER" as any,
      isSeller: false,
      emailVerified: true,
    },
  });
  console.log("   ✅ Demo buyer created (buyer@agentstore.com / SuperPassword123)\n");

  console.log("🎉 Database seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
