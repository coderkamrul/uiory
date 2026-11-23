import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://uiory.com";

  return {
    rules: [
      {
        // Standard Search Engines: Google, Bing, DuckDuckGo, Yahoo, etc.
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/services",
          "/contact",
          "/components/",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/login",
          "/signup",
        ],
      },
      {
        // AI Search Engines, Assistants & Crawlers:
        // OpenAI (ChatGPT / SearchGPT), Anthropic (Claude), Perplexity, Google Gemini, Apple Intelligence, etc.
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Claude-Web",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "CCBot",
          "Bytespider",
        ],
        allow: [
          "/",
          "/about",
          "/services",
          "/contact",
          "/components/",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
