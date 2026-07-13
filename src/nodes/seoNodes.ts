import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";
import { serpScraperTool, tfIdfAnalyzerTool, indexingApiTool } from "../tools/seoTools";

// ═══════════════════════════════════════════════════════════
// SEO AGENT NODES — Live SERP, TF-IDF, Strict Review Loop
// ═══════════════════════════════════════════════════════════

export const createSeoNodes = (llm: ChatOpenAI) => {

  const seoResearcherNode = async (state: typeof CampaignState.State) => {
    console.log("\n🔍 ═══ SEO AGENT ═══");
    console.log("🕵️  [SEO Researcher] Analyzing LIVE SERP & Semantic data...");
    const keyword = state.keyword;

    const serpOutput = await serpScraperTool.invoke({ keyword });

    let urls: string[] = [];
    try {
      const parsedSerp = JSON.parse(serpOutput);
      urls = parsedSerp.map((item: any) => item.url);
    } catch (e) {
      console.log("   ⚠️  Could not parse SERP output, using fallback");
    }

    const semanticOutput = await tfIdfAnalyzerTool.invoke({ urls });

    let lsiKeywords: string[] = [];
    try {
      lsiKeywords = JSON.parse(semanticOutput);
    } catch (e) {}

    return {
      serpData: serpOutput,
      semanticKeywords: lsiKeywords.length > 0 ? lsiKeywords : [keyword.toLowerCase()],
      seoRevisionCount: 0,
    };
  };

  const seoStrategistNode = async (state: typeof CampaignState.State) => {
    console.log("🧠 [SEO Strategist] Building SEO Blueprint...");
    const prompt = `You are an elite SEO Strategist. 
    Target Keyword: ${state.keyword}
    Business: ${state.businessName} — ${state.businessDescription}
    Target Audience: ${state.targetAudience}
    Competitor Data: ${state.serpData}
    Mandatory LSI Keywords: ${state.semanticKeywords.join(", ")}
    
    Create a strict, comprehensive SEO content brief for the writer. Include:
    1. Primary H1 title (must contain target keyword)
    2. 5-7 H2 subheadings structure
    3. Mandatory LSI keywords to include
    4. Content intent and angle
    5. Meta title (max 60 chars) and meta description (max 160 chars)
    6. Internal linking suggestions
    
    Be extremely specific and actionable.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return { seoBrief: response.content as string };
  };

  const seoWriterNode = async (state: typeof CampaignState.State) => {
    console.log(`✍️  [SEO Writer] Drafting SEO Content (Revision: ${state.seoRevisionCount})...`);

    let prompt = `You are a master SEO content writer. Write a highly engaging, SEO-optimized article (1500+ words) based strictly on this brief:
    \n${state.seoBrief}\n\n
    Requirements:
    - Use ALL mandatory LSI keywords naturally
    - Include proper H1, H2, H3 heading hierarchy
    - Write in a conversational, authoritative tone
    - Add FAQ section at the end with 3-5 questions
    - Include a compelling introduction with a hook`;

    if (state.seoReviewFeedback) {
      prompt += `\n\nWARNING — PREVIOUS DRAFT REJECTED. Fix these strict issues:\n${state.seoReviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    return {
      seoContentDraft: response.content as string,
      seoRevisionCount: state.seoRevisionCount + 1,
    };
  };

  const seoReviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [SEO Strict Reviewer] Evaluating Draft...");

    const prompt = `You are a STRICT SEO Quality Reviewer. Evaluate this content against mandatory criteria.
    Target Keyword: ${state.keyword}
    Mandatory LSI Keywords: ${state.semanticKeywords.join(", ")}
    
    Draft:
    ${state.seoContentDraft}
    
    CHECKLIST:
    1. Does the H1 contain the target keyword?
    2. Are ALL mandatory LSI keywords present?
    3. Is the content 1000+ words?
    4. Does it read naturally (not keyword-stuffed)?
    5. Is there a proper heading hierarchy (H1 > H2 > H3)?
    6. Is there an FAQ section?
    
    If it passes ALL tests perfectly, output exactly: "PASS"
    If any criteria fails, output: "FAIL:" followed by specific feedback for each failed item.`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;
    const isApproved = content.trim().toUpperCase().startsWith("PASS");

    if (isApproved) {
      console.log("   ✅ [SEO Reviewer] Draft STRICTLY APPROVED!");
    } else {
      console.log("   ❌ [SEO Reviewer] Draft REJECTED → Sending back to Writer");
    }

    return {
      seoIsApproved: isApproved,
      seoReviewFeedback: isApproved ? "" : content,
    };
  };

  const seoPublisherNode = async (state: typeof CampaignState.State) => {
    console.log("🚀 [SEO Publisher] Publishing & Requesting Google Indexing...");
    const slug = state.keyword.replace(/\s+/g, "-").toLowerCase();
    const url = `https://${state.businessName.replace(/\s+/g, "").toLowerCase()}.com/blog/${slug}`;
    await indexingApiTool.invoke({ url });
    return { seoPublishedUrl: url };
  };

  return { seoResearcherNode, seoStrategistNode, seoWriterNode, seoReviewerNode, seoPublisherNode };
};
