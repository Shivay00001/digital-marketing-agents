import { getLLM } from "./llmFactory";
import { buildGraph } from "./graph";
import * as dotenv from "dotenv";

dotenv.config();

async function runStrictCampaign() {
  console.log("=========================================================");
  console.log("🚀 STARTING STRICT-MONITORED AI MARKETING SYSTEM");
  console.log("=========================================================\n");

  // Initialize the LLM via Factory (defaults to gpt4free)
  const llm = getLLM();

  const graph = buildGraph(llm);

  const targetKeyword = "AI Automation for Digital Marketing";
  console.log(`🎯 Target Keyword: "${targetKeyword}"`);
  console.log("⚙️  Executing Strict StateGraph Pipeline...\n");

  try {
    const finalState = await graph.invoke({
      keyword: targetKeyword,
      revisionCount: 0
    });

    console.log("\n\n✅ CAMPAIGN COMPLETED SUCCESSFULLY");
    console.log("=========================================================");
    console.log("🔗 FINAL PUBLISHED URL:");
    console.log(finalState.publishedUrl);
    console.log("\n📝 FINAL APPROVED DRAFT PREVIEW (First 250 chars):");
    console.log(finalState.contentDraft.substring(0, 250) + "...");
    console.log("=========================================================");
    
  } catch (error) {
    console.error("❌ Execution Failed:", error);
  }
}

runStrictCampaign();
