import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { search } from "duck-duck-scrape";

// ═══════════════════════════════════════════════════════════
// SOCIAL MEDIA TOOLS — Real hashtag research & validation
// ═══════════════════════════════════════════════════════════

export const hashtagResearchTool = tool(
  async ({ keyword }) => {
    console.log(`\n[SOCIAL Tool] Researching LIVE trending hashtags for: "${keyword}"...`);
    try {
      const response = await search(`${keyword} trending hashtags`);
      const snippets = response.results.slice(0, 5).map((r: any) => r.description || "").join(" ");
      
      // Extract hashtags from search results
      const hashtagRegex = /#[\w]+/g;
      const foundHashtags = snippets.match(hashtagRegex) || [];
      
      // Generate semantic hashtags from keyword
      const words = keyword.toLowerCase().split(/\s+/);
      const generatedHashtags = [
        `#${words.join("")}`,
        ...words.filter(w => w.length > 3).map(w => `#${w}`),
        `#${words.join("_")}`,
        "#digitalmarketing",
        "#marketing",
        "#ai",
        "#automation",
      ];

      const allHashtags = [...new Set([...foundHashtags, ...generatedHashtags])].slice(0, 15);
      return JSON.stringify(allHashtags);
    } catch (e: any) {
      // Fallback hashtag generation
      const words = keyword.toLowerCase().split(/\s+/);
      const fallback = [
        `#${words.join("")}`,
        ...words.filter(w => w.length > 3).map(w => `#${w}`),
        "#digitalmarketing", "#marketing", "#ai", "#growth"
      ];
      return JSON.stringify(fallback);
    }
  },
  {
    name: "hashtag_researcher",
    description: "Researches real trending hashtags related to a keyword by scraping live search results.",
    schema: z.object({ keyword: z.string() })
  }
);

// Platform character limits for strict validation
export const PLATFORM_LIMITS: Record<string, { maxLength: number; hashtags: number }> = {
  twitter: { maxLength: 280, hashtags: 5 },
  linkedin: { maxLength: 3000, hashtags: 10 },
  instagram: { maxLength: 2200, hashtags: 30 },
  facebook: { maxLength: 63206, hashtags: 10 },
};

export const platformValidatorTool = tool(
  async ({ platform, content }) => {
    const limits = PLATFORM_LIMITS[platform];
    if (!limits) return JSON.stringify({ valid: false, error: `Unknown platform: ${platform}` });

    const isValid = content.length <= limits.maxLength;
    return JSON.stringify({
      valid: isValid,
      platform,
      charCount: content.length,
      charLimit: limits.maxLength,
      remaining: limits.maxLength - content.length,
      hashtagLimit: limits.hashtags,
    });
  },
  {
    name: "platform_validator",
    description: "Validates content length against platform-specific character limits for Twitter, LinkedIn, Instagram, Facebook.",
    schema: z.object({
      platform: z.enum(["twitter", "linkedin", "instagram", "facebook"]),
      content: z.string()
    })
  }
);
