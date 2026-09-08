export interface AgentItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  categorySlug: string;
  platform: string;
  platformSlug: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  setupTimeMinutes: number;
  price: number;
  pricingModel: "one_time" | "subscription" | "free";
  rating: number;
  reviewsCount: number;
  salesCount: number;
  featured: boolean;
  trending: boolean;
  version: string;
  updatedAt: string;
  seller: {
    name: string;
    handle: string;
    verified: boolean;
    rating: number;
    salesCount: number;
    joinedDate: string;
  };
  features: string[];
  prerequisites: string[];
  tags: string[];
  demoType: "interactive" | "video" | "webhook";
}

export const AGENTS_CATALOG: AgentItem[] = [
  {
    id: "agent-1",
    title: "HubSpot Lead Scoring & Autonomous Outreach Agent",
    slug: "hubspot-lead-scoring-agent",
    tagline: "Enriches inbound form submissions, calculates predictive ICP score using Claude 3.5 Sonnet, and queues hyper-personalized email drafts.",
    description: "This production-ready n8n workflow automates your entire top-of-funnel inbound qualification. When a lead submits a form or books a demo, the agent pulls firmographic data via Clearbit/Apollo APIs, feeds customer context to Claude 3.5 Sonnet to score ICP alignment from 1-100, assigns sales tiers in HubSpot, and automatically generates custom email drafts ready for 1-click BDR approval.",
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
    featured: true,
    trending: true,
    version: "v1.4.2",
    updatedAt: "3 days ago",
    seller: {
      name: "Nexus Automation Labs",
      handle: "@nexus_auto",
      verified: true,
      rating: 4.95,
      salesCount: 1420,
      joinedDate: "Jan 2025",
    },
    features: [
      "Zero-code n8n workflow JSON ready for 1-click import",
      "Automated Claude 3.5 Sonnet ICP scoring prompt matrix",
      "Native bidirectional HubSpot CRM sync & contact property creation",
      "Slack / Teams instant alerts for VIP enterprise leads (>85 score)",
      "Comprehensive error handling & retry fallback webhooks",
    ],
    prerequisites: [
      "n8n instance (Self-hosted or n8n Cloud)",
      "OpenAI or Anthropic API Key",
      "HubSpot Private App Access Token",
    ],
    tags: ["sales", "hubspot", "lead-gen", "n8n", "claude-3.5"],
    demoType: "interactive",
  },
  {
    id: "agent-2",
    title: "Omnichannel Zendesk & Intercom Triage Agent",
    slug: "omnichannel-zendesk-triage-agent",
    tagline: "Autonomous L1 ticket categorization, sentiment diagnosis, knowledge-base retrieval (RAG), and zero-shot resolution.",
    description: "Stop wasting senior engineering and support hours on repetitive L1 inquiries. This LangChain-powered agent connects directly with Zendesk, Intercom, and Freshdesk. It embeds incoming customer tickets, retrieves matching internal docs and historical resolutions using vector embeddings, drafts human-sounding empathetic solutions, and escalates edge cases with summarized context.",
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
    featured: true,
    trending: false,
    version: "v2.1.0",
    updatedAt: "1 week ago",
    seller: {
      name: "CognitiveOps",
      handle: "@cognitive_ops",
      verified: true,
      rating: 4.88,
      salesCount: 890,
      joinedDate: "Feb 2025",
    },
    features: [
      "RAG pipeline with semantic chunking & reranking",
      "Zendesk & Intercom webhook listeners and tag sync",
      "Sentiment & churn-risk alerts to Customer Success teams",
      "Automated multilingual response translation in 32 languages",
      "Complete Python microservice with Dockerfile included",
    ],
    prerequisites: [
      "Python 3.11+ / Docker",
      "Zendesk or Intercom API Key",
      "OpenAI API Key (Embeddings & GPT-4o)",
      "Pinecone / pgvector instance",
    ],
    tags: ["support", "rag", "langchain", "zendesk", "intercom"],
    demoType: "interactive",
  },
  {
    id: "agent-3",
    title: "Autonomous Multi-Platform Social & SEO Content Studio",
    slug: "seo-social-content-studio-agent",
    tagline: "Researches trending topics via Perplexity API, drafts SEO-optimized blog posts, and reformats into viral LinkedIn and Twitter threads.",
    description: "An end-to-end autonomous content creation squad built on Make.com. It monitors Google Trends, Reddit, and Hacker News RSS feeds for industry keywords, fetches verified research citations, formats long-form markdown articles formatted for Ghost/WordPress, and generates 5 cross-platform derivative posts with Dall-E 3 image prompts.",
    category: "Marketing & Content",
    categorySlug: "marketing-content",
    platform: "Make.com",
    platformSlug: "make",
    difficulty: "Beginner",
    setupTimeMinutes: 20,
    price: 39,
    pricingModel: "one_time",
    rating: 4.75,
    reviewsCount: 29,
    salesCount: 215,
    featured: false,
    trending: true,
    version: "v1.2.0",
    updatedAt: "5 days ago",
    seller: {
      name: "GrowthGenius",
      handle: "@growth_genius",
      verified: true,
      rating: 4.7,
      salesCount: 610,
      joinedDate: "Nov 2024",
    },
    features: [
      "Make.com blueprint file with blueprint mapping notes",
      "Web scraping & citation validation via Perplexity API",
      "Auto-publishing integration with WordPress, Ghost & Notion",
      "Viral hook generator trained on 10,000+ viral LinkedIn posts",
      "Configurable brand voice & negative keyword filter",
    ],
    prerequisites: [
      "Make.com account (Core or Pro)",
      "Perplexity or OpenAI API Key",
      "Target CMS webhook or API key",
    ],
    tags: ["marketing", "seo", "make", "social-media", "content"],
    demoType: "video",
  },
  {
    id: "agent-4",
    title: "Kubernetes Incident Sentry & Auto-Remediation Agent",
    slug: "kubernetes-incident-sentry-agent",
    tagline: "Monitors Prometheus/Datadog alerts, analyzes pod crashes, executes diagnostic runbooks, and proposes pull-request fixes.",
    description: "Tired of 3 AM PagerDuty alerts? Kubernetes Sentry operates as an autonomous on-call assistant. When CrashLoopBackOff or memory pressure occurs, it connects via read-only kube-api, fetches logs & events, identifies root causes with GPT-4o reasoning, applies temporary self-healing policies, and prepares a GitHub PR or Slack post-mortem report.",
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
    featured: true,
    trending: true,
    version: "v3.0.1",
    updatedAt: "Yesterday",
    seller: {
      name: "SRE Autopilot",
      handle: "@sre_autopilot",
      verified: true,
      rating: 4.98,
      salesCount: 420,
      joinedDate: "Dec 2024",
    },
    features: [
      "Non-destructive read-only RBAC execution mode by default",
      "CrashLoopBackOff & OOMKilled automatic triage & memory tuning",
      "Slack Interactive BlockKit alerting with 'Approve Fix' button",
      "Auto-generates GitHub PR with manifest patch suggestions",
      "Full Helm chart deployment ready for any cluster",
    ],
    prerequisites: [
      "Kubernetes cluster (v1.24+)",
      "Prometheus Alertmanager or Datadog Webhook",
      "OpenAI API Key",
      "GitHub Personal Access Token (for PRs)",
    ],
    tags: ["devops", "kubernetes", "sre", "monitoring", "python"],
    demoType: "interactive",
  },
  {
    id: "agent-5",
    title: "SQL Data Analyst & Autonomous Executive Reporter",
    slug: "sql-data-analyst-agent",
    tagline: "Converts natural language queries into bulletproof Postgres/Snowflake SQL queries, generates charts, and sends daily Slack digests.",
    description: "Empower non-technical team members with instant data insights. Built with Flowise and LangChain, this agent maintains a schema cache of your data warehouse, writes optimized read-only queries, calculates retention, cohort, and revenue metrics, and plots interactive visualizations.",
    category: "Data & Analytics",
    categorySlug: "data-analytics",
    platform: "Flowise",
    platformSlug: "flowise",
    difficulty: "Intermediate",
    setupTimeMinutes: 20,
    price: 45,
    pricingModel: "one_time",
    rating: 4.7,
    reviewsCount: 19,
    salesCount: 180,
    featured: false,
    trending: false,
    version: "v1.1.4",
    updatedAt: "2 weeks ago",
    seller: {
      name: "InsightCraft",
      handle: "@insightcraft",
      verified: false,
      rating: 4.7,
      salesCount: 180,
      joinedDate: "Mar 2025",
    },
    features: [
      "Flowise chatflow export with schema reflection tool",
      "Strict read-only safety guardrails (blocks DROP/UPDATE/DELETE)",
      "Highcharts / Chart.js auto-generation prompt template",
      "Daily scheduled automated KPI digest to Slack channels",
    ],
    prerequisites: [
      "Flowise or Docker",
      "PostgreSQL, MySQL, or Snowflake read-only user",
      "OpenAI API Key",
    ],
    tags: ["analytics", "sql", "flowise", "reporting", "charts"],
    demoType: "interactive",
  },
  {
    id: "agent-6",
    title: "Autonomous Code Reviewer & Security Audit Agent",
    slug: "autonomous-code-reviewer-agent",
    tagline: "Automated GitHub Actions agent that scans PRs for OWASP vulnerabilities, race conditions, memory leaks, and style consistency.",
    description: "Accelerate your code review velocity. This GitHub Action agent reviews every pull request within 60 seconds. It checks for SQL injection, hardcoded secrets, logic bugs, test coverage blindspots, and benchmark regressions with actionable inline line comments.",
    category: "Engineering & DevOps",
    categorySlug: "engineering-devops",
    platform: "Custom API / Python",
    platformSlug: "custom-api",
    difficulty: "Beginner",
    setupTimeMinutes: 10,
    price: 0,
    pricingModel: "free",
    rating: 4.8,
    reviewsCount: 64,
    salesCount: 1250,
    featured: true,
    trending: true,
    version: "v2.0.0",
    updatedAt: "4 days ago",
    seller: {
      name: "SecOps Open Source",
      handle: "@secops_os",
      verified: true,
      rating: 4.85,
      salesCount: 3100,
      joinedDate: "Oct 2024",
    },
    features: [
      "Zero-config GitHub Action workflow (.yml)",
      "Pre-configured OWASP Top 10 rule engine",
      "Secret scanning & regex API key detection",
      "Support for TypeScript, Python, Go, Rust, and Java",
      "100% Free & Open Source under MIT License",
    ],
    prerequisites: [
      "GitHub Repository",
      "OpenAI or Anthropic API Key in GitHub Secrets",
    ],
    tags: ["security", "code-review", "github-actions", "free", "open-source"],
    demoType: "video",
  },
];
