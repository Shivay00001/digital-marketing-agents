import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";

// ═══════════════════════════════════════════════════════════
// ANALYTICS & REPORTING AGENT — Full campaign analysis
// ═══════════════════════════════════════════════════════════

export const createAnalyticsNodes = (llm: ChatOpenAI) => {

  const campaignAnalyzerNode = async (state: typeof CampaignState.State) => {
    console.log("\n📊 ═══ ANALYTICS & REPORTING AGENT ═══");
    console.log("📈 [Campaign Analyzer] Analyzing all agent outputs...");

    const prompt = `You are a senior digital marketing analyst. Analyze this COMPLETE multi-channel campaign and provide a comprehensive assessment.
    
    === CAMPAIGN OVERVIEW ===
    Business: ${state.businessName} — ${state.businessDescription}
    Target Keyword: ${state.keyword}
    Target Audience: ${state.targetAudience}
    
    === SEO AGENT RESULTS ===
    - Published URL: ${state.seoPublishedUrl || "Pending"}
    - LSI Keywords Used: ${state.semanticKeywords?.join(", ") || "N/A"}
    - Revisions Needed: ${state.seoRevisionCount || 0}
    - Content Preview: ${state.seoContentDraft?.substring(0, 500) || "N/A"}
    
    === BLOG AGENT RESULTS ===
    - Revisions Needed: ${state.blogRevisionCount || 0}
    - Has Meta Tags: ${state.blogMetaTags ? "Yes" : "No"}
    - Has Schema Markup: ${state.blogSchemaMarkup ? "Yes" : "No"}
    - Content Preview: ${state.blogDraft?.substring(0, 500) || "N/A"}
    
    === SOCIAL MEDIA AGENT RESULTS ===
    - Platforms Covered: Twitter, LinkedIn, Instagram, Facebook
    - Hashtags Generated: ${state.hashtags?.join(", ") || "N/A"}
    - Revisions Needed: ${state.socialRevisionCount || 0}
    - Twitter Preview: ${state.twitterPost?.substring(0, 200) || "N/A"}
    
    === PAID ADS AGENT RESULTS ===
    - Google Ads Created: ${state.googleAdsVariants ? "Yes" : "No"}
    - Facebook Ads Created: ${state.facebookAdsVariants ? "Yes" : "No"}
    - Negative Keywords: ${state.negativeKeywords?.join(", ") || "N/A"}
    - Revisions Needed: ${state.adRevisionCount || 0}
    
    === EMAIL MARKETING AGENT RESULTS ===
    - Subject Lines: ${state.emailSubjectLines?.join(" | ") || "N/A"}
    - CTA Variants: ${state.emailCtaVariants?.join(" | ") || "N/A"}
    - Revisions Needed: ${state.emailRevisionCount || 0}
    
    Generate a COMPREHENSIVE CAMPAIGN REPORT with:
    
    1. **EXECUTIVE SUMMARY** — One paragraph overview of entire campaign readiness
    
    2. **CHANNEL SCORES** — Rate each channel 1-10:
       - SEO Content Quality
       - Blog Content Quality
       - Social Media Readiness
       - Paid Ads Effectiveness
       - Email Campaign Strength
    
    3. **OVERALL CAMPAIGN SCORE** — Single number 1-100
    
    4. **STRENGTHS** — Top 3 things this campaign does well
    
    5. **WEAKNESSES** — Top 3 areas for improvement
    
    6. **RECOMMENDATIONS** — 5 specific, actionable next steps
    
    7. **PREDICTED PERFORMANCE** — Expected impact on:
       - Organic traffic growth (%)
       - Social media engagement rate
       - Email open rate prediction
       - Ad CTR prediction
    
    8. **CAMPAIGN TIMELINE** — Suggested rollout schedule (Week 1-4)
    
    End with OVERALL_SCORE: [number] on the last line.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    // Extract overall score
    const scoreMatch = content.match(/OVERALL_SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    return {
      campaignReport: content,
      overallScore: Math.min(score, 100),
    };
  };

  return { campaignAnalyzerNode };
};
