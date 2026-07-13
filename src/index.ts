import { getLLM } from "./llmFactory";
import { buildMasterGraph } from "./graphs/masterGraph";
import * as dotenv from "dotenv";

dotenv.config();

// ═══════════════════════════════════════════════════════════
// MULTI-AGENT DIGITAL MARKETING AI SYSTEM
// Master Coordinator — Runs all 6 agent pipelines
// ═══════════════════════════════════════════════════════════

async function runFullCampaign() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  🚀 MULTI-AGENT AI DIGITAL MARKETING SYSTEM             ║");
  console.log("║  ═══════════════════════════════════════════════════════  ║");
  console.log("║  6 Specialized AI Agents • Strict Review Loops           ║");
  console.log("║  SEO │ Blog │ Social │ Ads │ Email │ Analytics           ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  const llm = getLLM();
  const providerName = (process.env.LLM_PROVIDER || "gpt4free").toUpperCase();
  console.log(`🤖 LLM Provider: [${providerName}]`);

  // ── Campaign Configuration ──
  const campaignConfig = {
    keyword: process.env.TARGET_KEYWORD || "AI Automation for Digital Marketing",
    businessName: process.env.BUSINESS_NAME || "MarketingAI Pro",
    businessDescription: process.env.BUSINESS_DESC || "AI-powered digital marketing automation platform that helps businesses scale their online presence with intelligent agents",
    targetAudience: process.env.TARGET_AUDIENCE || "Digital marketers, small business owners, marketing agencies, and entrepreneurs looking to automate and scale their marketing efforts",
  };

  console.log(`🎯 Target Keyword: "${campaignConfig.keyword}"`);
  console.log(`🏢 Business: ${campaignConfig.businessName}`);
  console.log(`👥 Audience: ${campaignConfig.targetAudience.substring(0, 80)}...`);
  console.log("\n⚙️  Executing 6-Agent StateGraph Pipeline...");
  console.log("─".repeat(60));

  const startTime = Date.now();

  try {
    const graph = buildMasterGraph(llm);

    const finalState = await graph.invoke({
      ...campaignConfig,
      seoRevisionCount: 0,
      blogRevisionCount: 0,
      socialRevisionCount: 0,
      adRevisionCount: 0,
      emailRevisionCount: 0,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║  ✅ CAMPAIGN COMPLETED SUCCESSFULLY                      ║");
    console.log(`║  ⏱️  Total Time: ${elapsed}s                                    ║`);
    console.log("╚═══════════════════════════════════════════════════════════╝");

    // ── SEO Results ──
    console.log("\n🔍 ═══ SEO RESULTS ═══");
    console.log(`   Published URL: ${finalState.seoPublishedUrl || "N/A"}`);
    console.log(`   LSI Keywords: ${finalState.semanticKeywords?.join(", ") || "N/A"}`);
    console.log(`   Revisions: ${finalState.seoRevisionCount}`);
    console.log(`   Content Preview: ${finalState.seoContentDraft?.substring(0, 200) || "N/A"}...`);

    // ── Blog Results ──
    console.log("\n📝 ═══ BLOG RESULTS ═══");
    console.log(`   Has Meta Tags: ${finalState.blogMetaTags ? "✅" : "❌"}`);
    console.log(`   Has Schema Markup: ${finalState.blogSchemaMarkup ? "✅" : "❌"}`);
    console.log(`   Revisions: ${finalState.blogRevisionCount}`);
    console.log(`   Content Preview: ${finalState.blogDraft?.substring(0, 200) || "N/A"}...`);

    // ── Social Media Results ──
    console.log("\n📱 ═══ SOCIAL MEDIA RESULTS ═══");
    console.log(`   Hashtags: ${finalState.hashtags?.join(" ") || "N/A"}`);
    console.log(`   Twitter: ${finalState.twitterPost?.substring(0, 150) || "N/A"}...`);
    console.log(`   LinkedIn: ${finalState.linkedinPost?.substring(0, 150) || "N/A"}...`);
    console.log(`   Instagram: ${finalState.instagramCaption?.substring(0, 150) || "N/A"}...`);
    console.log(`   Facebook: ${finalState.facebookPost?.substring(0, 150) || "N/A"}...`);

    // ── Paid Ads Results ──
    console.log("\n💰 ═══ PAID ADS RESULTS ═══");
    console.log(`   Google Ads: ${finalState.googleAdsVariants ? "✅ Generated" : "❌"}`);
    console.log(`   Facebook Ads: ${finalState.facebookAdsVariants ? "✅ Generated" : "❌"}`);
    console.log(`   Negative Keywords: ${finalState.negativeKeywords?.join(", ") || "N/A"}`);
    console.log(`   Revisions: ${finalState.adRevisionCount}`);

    // ── Email Results ──
    console.log("\n📧 ═══ EMAIL MARKETING RESULTS ═══");
    console.log(`   Subject Lines: ${finalState.emailSubjectLines?.join(" | ") || "N/A"}`);
    console.log(`   CTA Variants: ${finalState.emailCtaVariants?.join(" | ") || "N/A"}`);
    console.log(`   Revisions: ${finalState.emailRevisionCount}`);

    // ── Campaign Report ──
    console.log("\n📊 ═══ CAMPAIGN ANALYTICS REPORT ═══");
    console.log(`   Overall Score: ${finalState.overallScore}/100`);
    console.log("─".repeat(60));
    console.log(finalState.campaignReport || "Report not generated");
    console.log("─".repeat(60));

    console.log("\n🏁 All 6 agents have completed their tasks!");
    console.log("═".repeat(60));

  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n❌ Execution Failed after ${elapsed}s:`, error);
  }
}

runFullCampaign();
