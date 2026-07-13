import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";

// ═══════════════════════════════════════════════════════════
// EMAIL MARKETING AGENT NODES — Campaigns, subject lines, CTAs
// ═══════════════════════════════════════════════════════════

export const createEmailNodes = (llm: ChatOpenAI) => {

  const emailStrategistNode = async (state: typeof CampaignState.State) => {
    console.log("\n📧 ═══ EMAIL MARKETING AGENT ═══");
    console.log("🎯 [Email Strategist] Planning email campaign...");

    const prompt = `You are an expert email marketing strategist.
    Business: ${state.businessName} — ${state.businessDescription}
    Target Audience: ${state.targetAudience}
    Campaign Topic: ${state.keyword}
    
    Create a complete email marketing strategy:
    1. Campaign Goal (awareness, conversion, nurture, etc.)
    2. Email Sequence (how many emails, timing, purpose of each)
    3. Segmentation Strategy (who gets which email)
    4. Subject Line Best Practices for this campaign
    5. Personalization Opportunities
    6. Key Metrics to Track (open rate, CTR, conversion targets)
    7. Send Time Optimization recommendations
    
    Be specific and data-driven.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return {
      emailStrategy: response.content as string,
      emailRevisionCount: 0,
    };
  };

  const emailWriterNode = async (state: typeof CampaignState.State) => {
    console.log(`✍️  [Email Writer] Crafting email campaign (Revision: ${state.emailRevisionCount})...`);

    let prompt = `You are a world-class email copywriter known for high open rates and conversions.
    
    Business: ${state.businessName}
    Campaign Strategy: ${state.emailStrategy}
    Topic: ${state.keyword}
    
    Write a COMPLETE email including:
    
    1. **5 SUBJECT LINE VARIANTS** (A/B test ready):
       - Use power words, numbers, personalization tokens
       - Mix of curiosity, benefit-driven, and urgency styles
       - Each under 50 characters for mobile optimization
    
    2. **PREVIEW TEXT** (40-90 chars, complements subject line)
    
    3. **EMAIL BODY**:
       - Compelling opening line (no "Hi there" generic intros)
       - Problem-agitation-solution framework
       - 2-3 bullet points highlighting key benefits
       - Social proof element (testimonial, stat, or case study)
       - Clear, single CTA button text
       - P.S. line with secondary offer/urgency
    
    4. **3 CTA BUTTON VARIANTS** (action-oriented, under 5 words each)
    
    Format the email in a ready-to-use template structure.`;

    if (state.emailReviewFeedback) {
      prompt += `\n\nPREVIOUS EMAIL REJECTED. Fix these issues:\n${state.emailReviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    // Extract subject lines
    const subjectLineRegex = /(?:subject\s*line|variant)\s*\d?\s*:?\s*[""]?([^"""\n]+)/gi;
    const matches = content.matchAll(subjectLineRegex);
    const subjectLines = Array.from(matches).map(m => m[1].trim()).filter(s => s.length > 5).slice(0, 5);

    // Extract CTAs
    const ctaRegex = /(?:CTA|button)\s*(?:variant)?\s*\d?\s*:?\s*[""]?([^"""\n]+)/gi;
    const ctaMatches = content.matchAll(ctaRegex);
    const ctas = Array.from(ctaMatches).map(m => m[1].trim()).filter(s => s.length > 3).slice(0, 3);

    return {
      emailBody: content,
      emailSubjectLines: subjectLines.length > 0 ? subjectLines : ["Check this out", "You won't want to miss this"],
      emailCtaVariants: ctas.length > 0 ? ctas : ["Get Started Now", "Learn More", "Claim Your Spot"],
      emailRevisionCount: state.emailRevisionCount + 1,
    };
  };

  const emailReviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [Email Strict Reviewer] Evaluating email campaign...");

    const prompt = `You are a strict email marketing reviewer. Evaluate this email:
    
    Subject Lines: ${state.emailSubjectLines.join(" | ")}
    CTAs: ${state.emailCtaVariants.join(" | ")}
    
    Email Body:
    ${state.emailBody}
    
    CHECKLIST:
    1. Are there at least 3 subject line variants?
    2. Are subject lines under 50 characters each?
    3. Is the opening line compelling (not generic)?
    4. Does it follow problem-agitation-solution framework?
    5. Are there clear benefits with bullet points?
    6. Is there social proof (testimonial/stat)?
    7. Is there a clear, single primary CTA?
    8. Is there a P.S. line?
    9. Is the email scannable and mobile-friendly?
    
    If ALL criteria pass, output exactly: "PASS"
    If any fails, output: "FAIL:" followed by specific improvements.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;
    const isApproved = content.trim().toUpperCase().startsWith("PASS");

    if (isApproved) {
      console.log("   ✅ [Email Reviewer] Email campaign APPROVED!");
    } else {
      console.log("   ❌ [Email Reviewer] Email REJECTED → Revising");
    }

    return {
      emailIsApproved: isApproved,
      emailReviewFeedback: isApproved ? "" : content,
    };
  };

  return { emailStrategistNode, emailWriterNode, emailReviewerNode };
};
