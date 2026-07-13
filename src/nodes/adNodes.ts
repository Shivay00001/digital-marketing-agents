import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";
import { negativeKeywordTool, adCompetitorResearchTool, GOOGLE_ADS_LIMITS } from "../tools/adTools";

// ═══════════════════════════════════════════════════════════
// PAID ADS AGENT NODES — Google Ads & Facebook Ads copy
// ═══════════════════════════════════════════════════════════

export const createAdNodes = (llm: ChatOpenAI) => {

  const adResearcherNode = async (state: typeof CampaignState.State) => {
    console.log("\n💰 ═══ PAID ADS AGENT ═══");
    console.log("🔍 [Ad Researcher] Analyzing competitor ad landscape...");

    const [competitorData, negativeKws] = await Promise.all([
      adCompetitorResearchTool.invoke({ keyword: state.keyword }),
      negativeKeywordTool.invoke({ keyword: state.keyword }),
    ]);

    let negatives: string[] = [];
    try {
      negatives = JSON.parse(negativeKws);
    } catch (e) {}

    return {
      adResearch: competitorData,
      negativeKeywords: negatives,
      adRevisionCount: 0,
    };
  };

  const adCopywriterNode = async (state: typeof CampaignState.State) => {
    console.log(`✍️  [Ad Copywriter] Writing ad variants (Revision: ${state.adRevisionCount})...`);

    let prompt = `You are an expert paid advertising copywriter with a proven track record of high-CTR ads.
    
    Business: ${state.businessName} — ${state.businessDescription}
    Target Audience: ${state.targetAudience}
    Primary Keyword: ${state.keyword}
    Competitor Research: ${state.adResearch}
    Negative Keywords to avoid: ${state.negativeKeywords.join(", ")}
    
    Generate TWO complete ad sets:
    
    === GOOGLE ADS ===
    Create 3 Responsive Search Ad variants. For EACH variant provide:
    - 5 Headlines (STRICT max ${GOOGLE_ADS_LIMITS.headline} chars EACH — this is critical!)
    - 2 Descriptions (STRICT max ${GOOGLE_ADS_LIMITS.description} chars EACH)
    - Display URL path suggestions
    
    CRITICAL: Count characters carefully. Headlines over ${GOOGLE_ADS_LIMITS.headline} chars will be REJECTED.
    
    === FACEBOOK/META ADS ===
    Create 3 ad variants. For EACH variant provide:
    - Primary Text (125 chars recommended for above-the-fold)
    - Headline (40 chars max)
    - Description (30 chars max)
    - Call-to-Action button suggestion (Learn More, Sign Up, Shop Now, etc.)
    
    Focus on:
    - Emotional triggers and power words
    - Clear value propositions
    - Urgency and scarcity where appropriate
    - A/B testable variations`;

    if (state.adReviewFeedback) {
      prompt += `\n\nPREVIOUS ADS REJECTED. Fix these issues:\n${state.adReviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    // Split into Google and Facebook sections
    const fbIndex = content.toUpperCase().indexOf("FACEBOOK") !== -1
      ? content.toUpperCase().indexOf("FACEBOOK")
      : content.toUpperCase().indexOf("META");

    const googleAds = fbIndex > 0 ? content.substring(0, fbIndex).trim() : content;
    const facebookAds = fbIndex > 0 ? content.substring(fbIndex).trim() : "See full output above";

    return {
      googleAdsVariants: googleAds,
      facebookAdsVariants: facebookAds,
      adRevisionCount: state.adRevisionCount + 1,
    };
  };

  const adReviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [Ad Strict Reviewer] Validating ad copy...");

    const prompt = `You are a STRICT paid advertising reviewer. Validate these ads:
    
    GOOGLE ADS:
    ${state.googleAdsVariants}
    
    FACEBOOK ADS:
    ${state.facebookAdsVariants}
    
    STRICT CHECKLIST:
    1. Are ALL Google Ads headlines under ${GOOGLE_ADS_LIMITS.headline} characters each?
    2. Are ALL Google Ads descriptions under ${GOOGLE_ADS_LIMITS.description} characters each?
    3. Do ads contain clear value propositions?
    4. Are there strong CTAs?
    5. Are there at least 2 variants for A/B testing?
    6. Do Facebook ads have compelling primary text?
    7. Do ads avoid the negative keywords: ${state.negativeKeywords.slice(0, 5).join(", ")}?
    
    If ALL criteria pass, output exactly: "PASS"
    If any fails, output: "FAIL:" followed by specific character count violations and fixes.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;
    const isApproved = content.trim().toUpperCase().startsWith("PASS");

    if (isApproved) {
      console.log("   ✅ [Ad Reviewer] All ad variants APPROVED!");
    } else {
      console.log("   ❌ [Ad Reviewer] Ads REJECTED → Revising");
    }

    return {
      adIsApproved: isApproved,
      adReviewFeedback: isApproved ? "" : content,
    };
  };

  return { adResearcherNode, adCopywriterNode, adReviewerNode };
};
