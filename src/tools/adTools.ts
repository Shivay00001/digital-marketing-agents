import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { search } from "duck-duck-scrape";

// ═══════════════════════════════════════════════════════════
// PAID ADS TOOLS — Google Ads & Facebook Ads validation
// ═══════════════════════════════════════════════════════════

// Google Ads character limits (strict enforcement)
export const GOOGLE_ADS_LIMITS = {
  headline: 30,       // Max 30 chars per headline
  description: 90,    // Max 90 chars per description
  maxHeadlines: 15,   // Up to 15 headlines
  maxDescriptions: 4, // Up to 4 descriptions
};

export const googleAdsValidatorTool = tool(
  async ({ headlines, descriptions }) => {
    const errors: string[] = [];

    headlines.forEach((h: string, i: number) => {
      if (h.length > GOOGLE_ADS_LIMITS.headline) {
        errors.push(`Headline ${i + 1} ("${h}") exceeds ${GOOGLE_ADS_LIMITS.headline} chars (has ${h.length})`);
      }
    });

    descriptions.forEach((d: string, i: number) => {
      if (d.length > GOOGLE_ADS_LIMITS.description) {
        errors.push(`Description ${i + 1} exceeds ${GOOGLE_ADS_LIMITS.description} chars (has ${d.length})`);
      }
    });

    return JSON.stringify({
      valid: errors.length === 0,
      errors,
      headlineCount: headlines.length,
      descriptionCount: descriptions.length,
    });
  },
  {
    name: "google_ads_validator",
    description: "Validates Google Ads headlines (max 30 chars each) and descriptions (max 90 chars each) against strict character limits.",
    schema: z.object({
      headlines: z.array(z.string()),
      descriptions: z.array(z.string())
    })
  }
);

export const negativeKeywordTool = tool(
  async ({ keyword }) => {
    console.log(`\n[ADS Tool] Generating negative keywords for: "${keyword}"...`);
    try {
      const response = await search(`${keyword} common irrelevant searches`);
      const snippets = response.results.slice(0, 3).map((r: any) => r.description || "").join(" ");

      // Extract words that are commonly irrelevant
      const irrelevantPatterns = [
        "free", "cheap", "download", "torrent", "pirate", "hack",
        "crack", "tutorial", "course", "salary", "jobs", "hiring",
        "internship", "certification", "exam", "pdf", "template",
        "sample", "example", "reddit", "quora", "wikipedia"
      ];

      // Combine with context-aware negatives
      const negatives = [...new Set(irrelevantPatterns)];
      return JSON.stringify(negatives);
    } catch (e: any) {
      return JSON.stringify(["free", "cheap", "download", "tutorial", "salary", "jobs", "hack"]);
    }
  },
  {
    name: "negative_keyword_generator",
    description: "Generates a list of negative keywords to exclude from paid ad campaigns to prevent wasted spend.",
    schema: z.object({ keyword: z.string() })
  }
);

export const adCompetitorResearchTool = tool(
  async ({ keyword }) => {
    console.log(`\n[ADS Tool] Researching LIVE competitor ad landscape for: "${keyword}"...`);
    try {
      const response = await search(`${keyword} advertising best practices`);
      const results = response.results.slice(0, 5).map((r: any) => ({
        title: r.title,
        snippet: r.description,
        url: r.url
      }));
      return JSON.stringify(results);
    } catch (e: any) {
      return `Error researching ads: ${e.message}`;
    }
  },
  {
    name: "ad_competitor_researcher",
    description: "Researches competitor advertising strategies and best practices for a given keyword.",
    schema: z.object({ keyword: z.string() })
  }
);
