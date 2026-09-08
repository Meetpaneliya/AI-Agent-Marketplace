import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "AgentStore — The ThemeForest of AI Agents",
    template: "%s | AgentStore",
  },
  description:
    "Browse, purchase, and download production-ready AI agents and automation workflows. The marketplace for n8n, Make, LangChain, and more.",
  keywords: [
    "AI agents",
    "automation workflows",
    "n8n templates",
    "Make blueprints",
    "LangChain agents",
    "AI marketplace",
  ],
  openGraph: {
    title: "AgentStore — The ThemeForest of AI Agents",
    description:
      "Browse, purchase, and download production-ready AI agents and automation workflows.",
    type: "website",
    siteName: "AgentStore",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-void text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
