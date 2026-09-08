import { PrismaClient } from "@prisma/client";

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
  await prisma.user.upsert({
    where: { email: "admin@agentstore.com" },
    update: {},
    create: {
      email: "admin@agentstore.com",
      passwordHash: "$2a$12$LJ3hXFXkP6Z6Y7Md7n0VKetqKN/dZs4bRwGmGZ3j7f7cDjH1GE.3K", // "admin123" hashed
      name: "AgentStore Admin",
      role: "super_admin",
      emailVerified: true,
    },
  });
  console.log("   ✅ Super admin created (admin@agentstore.com)\n");

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
