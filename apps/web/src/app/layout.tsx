import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06080F",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agentstore.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AgentStore — The ThemeForest of AI Agents & Workflows",
    template: "%s | AgentStore",
  },
  description:
    "Discover, purchase, and deploy enterprise-tested AI agents and automation blueprints. The verified creator marketplace for n8n, LangChain, Flowise, Make, and Python agents.",
  applicationName: "AgentStore",
  authors: [{ name: "AgentStore Team", url: SITE_URL }],
  creator: "AgentStore",
  publisher: "AgentStore",
  keywords: [
    "AI agents",
    "autonomous agents",
    "automation workflows",
    "n8n templates",
    "Make blueprints",
    "LangChain agents",
    "Flowise workflows",
    "AI marketplace",
    "enterprise AI automation",
    "agentic workflows",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AgentStore",
    title: "AgentStore — The ThemeForest of AI Agents & Workflows",
    description:
      "Discover, purchase, and deploy enterprise-tested AI agents and automation blueprints for n8n, LangChain, Make, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentStore — Verified AI Agent Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentStore — The ThemeForest of AI Agents & Workflows",
    description:
      "Discover, purchase, and deploy enterprise-tested AI agents and automation blueprints for n8n, LangChain, Make, and more.",
    creator: "@AgentStoreAI",
    site: "@AgentStoreAI",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AgentStore",
  url: SITE_URL,
  description:
    "The marketplace for verified, production-ready AI agents and autonomous workflows.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/agents?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AgentStore",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: ["https://twitter.com/AgentStoreAI", "https://github.com"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-void text-text-primary antialiased selection:bg-signal selection:text-white">
        {children}
      </body>
    </html>
  );
}
