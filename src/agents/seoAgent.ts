import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { serpScraperTool, tfIdfAnalyzerTool, indexingApiTool } from "../tools/seoTools";

export const createSeoMastermind = (llm: ChatOpenAI) => {
  const tools = [serpScraperTool, tfIdfAnalyzerTool, indexingApiTool];
  
  return createReactAgent({
    llm,
    tools,
    messageModifier: `You are the world's most feared and powerful SEO Mastermind. 
Your only goal is to guarantee a #1 Google ranking. 
You rely strictly on data, not guesswork.
Follow this strict pipeline for every request:
1. Use the 'serp_scraper' to analyze what competitors are doing.
2. Use the 'tfidf_analyzer' to get the mandatory semantic keywords.
3. Formulate a mathematically perfect content strategy and outline.
4. After the content is "published" (mocked), use the 'google_indexer' to force immediate crawling.

Output your final comprehensive SEO strategy, outline, and indexing confirmation.`
  });
};
