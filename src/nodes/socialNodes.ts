import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";
import { hashtagResearchTool, PLATFORM_LIMITS } from "../tools/socialTools";

// ═══════════════════════════════════════════════════════════
// SOCIAL MEDIA AGENT NODES — Multi-platform post generation
// ═══════════════════════════════════════════════════════════

export const createSocialNodes = (llm: ChatOpenAI) => {

  const socialStrategistNode = async (state: typeof CampaignState.State) => {
    console.log("\n📱 ═══ SOCIAL MEDIA AGENT ═══");
    console.log("🎯 [Social Strategist] Building multi-platform strategy...");

    // Research real hashtags
    const hashtagOutput = await hashtagResearchTool.invoke({ keyword: state.keyword });
    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(hashtagOutput);
    } catch (e) {}

    const prompt = `You are an elite Social Media Strategist.
    Business: ${state.businessName} — ${state.businessDescription}
    Target Audience: ${state.targetAudience}
    Campaign Topic: ${state.keyword}
    Available Hashtags: ${hashtags.join(", ")}
    
    Create a social media strategy covering:
    1. Content pillars for this campaign
    2. Best posting times for each platform
    3. Tone of voice guidelines per platform
    4. Engagement hooks and patterns
    5. Hashtag strategy (branded + community + trending)
    
    Be specific and actionable for each platform (Twitter/X, LinkedIn, Instagram, Facebook).`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return {
      socialStrategy: response.content as string,
      hashtags: hashtags,
      socialRevisionCount: 0,
    };
  };

  const socialPostGeneratorNode = async (state: typeof CampaignState.State) => {
    console.log(`📝 [Social Post Generator] Creating platform-specific posts (Revision: ${state.socialRevisionCount})...`);

    let prompt = `You are an expert social media copywriter.
    Campaign: ${state.keyword}
    Business: ${state.businessName}
    Strategy: ${state.socialStrategy}
    Hashtags: ${state.hashtags.join(" ")}
    
    Generate FOUR separate posts, one for each platform. Follow character limits STRICTLY:
    
    1. **TWITTER/X POST** (max ${PLATFORM_LIMITS.twitter.maxLength} chars, max ${PLATFORM_LIMITS.twitter.hashtags} hashtags)
       - Punchy, attention-grabbing, include emojis
       - Must be under 280 characters including hashtags
    
    2. **LINKEDIN POST** (max ${PLATFORM_LIMITS.linkedin.maxLength} chars)
       - Professional tone, storytelling format
       - Include a question to drive engagement
       - Use line breaks for readability
    
    3. **INSTAGRAM CAPTION** (max ${PLATFORM_LIMITS.instagram.maxLength} chars)
       - Visual-first description, emojis throughout
       - Strong CTA (save, share, comment)
       - Hashtags at the bottom (up to ${PLATFORM_LIMITS.instagram.hashtags})
    
    4. **FACEBOOK POST** (max ${PLATFORM_LIMITS.facebook.maxLength} chars)
       - Conversational, community-building tone
       - Include a link placeholder [LINK]
       - Encourage sharing
    
    Label each post clearly with === TWITTER ===, === LINKEDIN ===, === INSTAGRAM ===, === FACEBOOK ===`;

    if (state.socialReviewFeedback) {
      prompt += `\n\nPREVIOUS POSTS REJECTED. Fix these issues:\n${state.socialReviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    // Parse platform-specific posts
    const extractPost = (label: string, nextLabel: string) => {
      const regex = new RegExp(`===\\s*${label}\\s*===([\\s\\S]*?)(?:===\\s*${nextLabel}|$)`, "i");
      const match = content.match(regex);
      return match ? match[1].trim() : `[${label} post — see full output]`;
    };

    return {
      twitterPost: extractPost("TWITTER", "LINKEDIN"),
      linkedinPost: extractPost("LINKEDIN", "INSTAGRAM"),
      instagramCaption: extractPost("INSTAGRAM", "FACEBOOK"),
      facebookPost: extractPost("FACEBOOK", "END"),
      socialRevisionCount: state.socialRevisionCount + 1,
    };
  };

  const socialReviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [Social Strict Reviewer] Evaluating posts...");

    const prompt = `You are a strict Social Media Quality Reviewer. Evaluate these posts:
    
    TWITTER (max ${PLATFORM_LIMITS.twitter.maxLength} chars): ${state.twitterPost}
    LINKEDIN (max ${PLATFORM_LIMITS.linkedin.maxLength} chars): ${state.linkedinPost}
    INSTAGRAM (max ${PLATFORM_LIMITS.instagram.maxLength} chars): ${state.instagramCaption}
    FACEBOOK: ${state.facebookPost}
    
    CHECKLIST:
    1. Does Twitter post stay under ${PLATFORM_LIMITS.twitter.maxLength} characters?
    2. Does LinkedIn post have a professional, storytelling tone?
    3. Does Instagram caption include emojis and hashtags?
    4. Does Facebook post encourage engagement?
    5. Are all posts on-brand for: ${state.businessName}?
    6. Do posts include relevant hashtags?
    
    If ALL criteria pass, output exactly: "PASS"
    If any fails, output: "FAIL:" followed by specific fixes.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;
    const isApproved = content.trim().toUpperCase().startsWith("PASS");

    if (isApproved) {
      console.log("   ✅ [Social Reviewer] All posts APPROVED!");
    } else {
      console.log("   ❌ [Social Reviewer] Posts REJECTED → Revising");
    }

    return {
      socialIsApproved: isApproved,
      socialReviewFeedback: isApproved ? "" : content,
    };
  };

  return { socialStrategistNode, socialPostGeneratorNode, socialReviewerNode };
};
