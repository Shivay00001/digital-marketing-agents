import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";

// ═══════════════════════════════════════════════════════════
// BLOG AGENT NODES — Full blog posts with meta, schema, review
// ═══════════════════════════════════════════════════════════

export const createBlogNodes = (llm: ChatOpenAI) => {

  const blogPlannerNode = async (state: typeof CampaignState.State) => {
    console.log("\n📝 ═══ BLOG AGENT ═══");
    console.log("📋 [Blog Planner] Creating blog outline & structure...");

    const prompt = `You are an expert blog content strategist.
    Business: ${state.businessName} — ${state.businessDescription}
    Target Audience: ${state.targetAudience}
    Topic/Keyword: ${state.keyword}
    SEO Keywords to include: ${state.semanticKeywords.join(", ")}
    
    Create a detailed blog post outline with:
    1. A compelling, click-worthy title (include power words)
    2. 6-8 section headings with brief descriptions of what each covers
    3. Key statistics or data points to research and include
    4. Internal/external linking opportunities
    5. Call-to-action placement strategy
    6. Estimated word count per section
    
    Make this outline so detailed that any writer can produce an excellent article from it.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return { blogOutline: response.content as string, blogRevisionCount: 0 };
  };

  const blogWriterNode = async (state: typeof CampaignState.State) => {
    console.log(`✍️  [Blog Writer] Writing full blog post (Revision: ${state.blogRevisionCount})...`);

    let prompt = `You are a world-class blog writer. Write a comprehensive, engaging blog post based on this outline:
    
    ${state.blogOutline}
    
    Requirements:
    - 2000+ words minimum
    - Use a conversational yet authoritative tone
    - Include real statistics and data points (cite sources)
    - Add bullet points and numbered lists for readability
    - Include a strong introduction with a hook
    - End with a clear call-to-action
    - Use transition words between sections
    - Include relevant quotes or expert opinions
    - Make it scannable with subheadings every 200-300 words`;

    if (state.blogReviewFeedback) {
      prompt += `\n\nPREVIOUS DRAFT REJECTED. Fix these issues:\n${state.blogReviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return {
      blogDraft: response.content as string,
      blogRevisionCount: state.blogRevisionCount + 1,
    };
  };

  const blogMetaGeneratorNode = async (state: typeof CampaignState.State) => {
    console.log("🏷️  [Blog Meta Generator] Creating meta tags & schema markup...");

    const prompt = `Based on this blog post, generate:
    
    1. META TITLE (max 60 chars, include primary keyword)
    2. META DESCRIPTION (max 160 chars, compelling with CTA)
    3. OG TITLE for social sharing
    4. OG DESCRIPTION for social sharing
    5. JSON-LD SCHEMA MARKUP (Article type) — provide the complete script tag
    6. 5 focus keywords for the post
    
    Blog Content:
    ${state.blogDraft?.substring(0, 2000)}
    
    Keyword: ${state.keyword}
    Business: ${state.businessName}
    
    Output each section clearly labeled.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    // Try to extract schema markup
    const schemaMatch = content.match(/\{[\s\S]*"@context"[\s\S]*\}/);
    const schema = schemaMatch ? schemaMatch[0] : '{"@context":"https://schema.org","@type":"Article"}';

    return {
      blogMetaTags: content,
      blogSchemaMarkup: schema,
    };
  };

  const blogReviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [Blog Strict Reviewer] Evaluating blog post...");

    const prompt = `You are a strict blog content reviewer. Evaluate this blog post:
    
    ${state.blogDraft}
    
    CHECKLIST:
    1. Is it 1500+ words?
    2. Does it have a compelling title?
    3. Are there proper subheadings (H2, H3)?
    4. Is the introduction engaging with a hook?
    5. Does it include data/statistics?
    6. Is there a clear call-to-action at the end?
    7. Are SEO keywords naturally integrated?
    8. Is it scannable with bullet points/lists?
    
    If ALL criteria pass, output exactly: "PASS"
    If any criteria fails, output: "FAIL:" followed by specific improvements needed.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;
    const isApproved = content.trim().toUpperCase().startsWith("PASS");

    if (isApproved) {
      console.log("   ✅ [Blog Reviewer] Blog post APPROVED!");
    } else {
      console.log("   ❌ [Blog Reviewer] Blog REJECTED → Revising");
    }

    return {
      blogIsApproved: isApproved,
      blogReviewFeedback: isApproved ? "" : content,
    };
  };

  return { blogPlannerNode, blogWriterNode, blogMetaGeneratorNode, blogReviewerNode };
};
