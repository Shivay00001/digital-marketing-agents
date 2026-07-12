import { ChatOpenAI } from "@langchain/openai";
import { CampaignState } from "../state";
import { serpScraperTool, tfIdfAnalyzerTool, indexingApiTool } from "../tools/seoTools";

export const createNodes = (llm: ChatOpenAI) => {
  
  const researcherNode = async (state: typeof CampaignState.State) => {
    console.log("🕵️  [Researcher Node] Analyzing SERP & Semantic data...");
    const keyword = state.keyword;
    
    // Execute REAL tool execution for research
    const serpOutput = await serpScraperTool.invoke({ keyword });
    
    let urls: string[] = [];
    try {
      const parsedSerp = JSON.parse(serpOutput);
      urls = parsedSerp.map((item: any) => item.url);
    } catch(e) {
      console.log("Could not parse SERP output");
    }

    const semanticOutput = await tfIdfAnalyzerTool.invoke({ urls });
    
    let lsiKeywords = [];
    try {
      lsiKeywords = JSON.parse(semanticOutput);
    } catch(e) {}

    return {
      serpData: serpOutput,
      semanticKeywords: lsiKeywords,
      revisionCount: state.revisionCount || 0
    };
  };

  const strategistNode = async (state: typeof CampaignState.State) => {
    console.log("🧠 [Strategist Node] Building SEO Blueprint...");
    const prompt = `You are an elite SEO Strategist. 
    Target Keyword: ${state.keyword}
    Competitor Data: ${state.serpData}
    Mandatory LSI Keywords: ${state.semanticKeywords.join(", ")}
    
    Create a strict, comprehensive SEO content brief for the writer. Provide headings, intent guidelines, and mandatory keywords.`;
    
    const response = await llm.invoke([{ role: "user", content: prompt }]);
    
    return {
      seoBrief: response.content as string
    };
  };

  const writerNode = async (state: typeof CampaignState.State) => {
    console.log(`✍️  [Writer Node] Drafting Content (Revision: ${state.revisionCount})...`);
    
    let prompt = `You are a master content writer. Write a highly engaging, SEO-optimized article based strictly on this brief:
    \n${state.seoBrief}\n\n`;
    
    if (state.reviewFeedback) {
      prompt += `\nWARNING - PREVIOUS DRAFT REJECTED. Fix these strict issues: \n${state.reviewFeedback}`;
    }

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    
    return {
      contentDraft: response.content as string,
      revisionCount: state.revisionCount + 1
    };
  };

  const reviewerNode = async (state: typeof CampaignState.State) => {
    console.log("🧐 [Strict Reviewer Node] Evaluating Draft...");
    
    const prompt = `You are a STRICT SEO Reviewer. You must evaluate the drafted content against the mandatory keywords.
    Target Keyword: ${state.keyword}
    Mandatory LSI Keywords: ${state.semanticKeywords.join(", ")}
    
    Draft:
    ${state.contentDraft}
    
    Check if ALL mandatory keywords are present. Check if it reads naturally.
    If it passes ALL tests perfectly, output exactly the word "PASS".
    If any keywords are missing or the quality is poor, output a list of strict feedback starting with "FAIL: "`;

    const response = await llm.invoke([{ role: "user", content: prompt }]);
    const content = response.content as string;

    const isApproved = content.trim().startsWith("PASS");
    const feedback = isApproved ? "" : content;
    
    if (isApproved) {
      console.log("✅ [Reviewer] Draft STRICTLY APPROVED.");
    } else {
      console.log("❌ [Reviewer] Draft REJECTED. Sending back to Writer.");
    }

    return {
      isApproved: isApproved,
      reviewFeedback: feedback
    };
  };

  const publisherNode = async (state: typeof CampaignState.State) => {
    console.log("🚀 [Publisher Node] Simulating Publish & Indexing...");
    
    const fakeUrl = `https://example.com/${state.keyword.replace(/\s+/g, '-').toLowerCase()}`;
    await indexingApiTool.invoke({ url: fakeUrl });
    
    return {
      publishedUrl: fakeUrl,
    };
  };

  return { researcherNode, strategistNode, writerNode, reviewerNode, publisherNode };
};
