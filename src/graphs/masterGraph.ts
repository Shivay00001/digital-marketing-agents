import { StateGraph, END, START } from "@langchain/langgraph";
import { CampaignState } from "../state";
import { ChatOpenAI } from "@langchain/openai";
import { createSeoNodes } from "../nodes/seoNodes";
import { createBlogNodes } from "../nodes/blogNodes";
import { createSocialNodes } from "../nodes/socialNodes";
import { createAdNodes } from "../nodes/adNodes";
import { createEmailNodes } from "../nodes/emailNodes";
import { createAnalyticsNodes } from "../nodes/analyticsNodes";

// ═══════════════════════════════════════════════════════════
// MASTER ORCHESTRATOR GRAPH
// Runs all 6 agent pipelines with strict review loops
// ═══════════════════════════════════════════════════════════

export const buildMasterGraph = (llm: ChatOpenAI) => {
  const seo = createSeoNodes(llm);
  const blog = createBlogNodes(llm);
  const social = createSocialNodes(llm);
  const ads = createAdNodes(llm);
  const email = createEmailNodes(llm);
  const analytics = createAnalyticsNodes(llm);

  const workflow = new StateGraph(CampaignState)

    // ── SEO Pipeline Nodes ──
    .addNode("seo_researcher", seo.seoResearcherNode)
    .addNode("seo_strategist", seo.seoStrategistNode)
    .addNode("seo_writer", seo.seoWriterNode)
    .addNode("seo_reviewer", seo.seoReviewerNode)
    .addNode("seo_publisher", seo.seoPublisherNode)

    // ── Blog Pipeline Nodes ──
    .addNode("blog_planner", blog.blogPlannerNode)
    .addNode("blog_writer", blog.blogWriterNode)
    .addNode("blog_meta", blog.blogMetaGeneratorNode)
    .addNode("blog_reviewer", blog.blogReviewerNode)

    // ── Social Media Pipeline Nodes ──
    .addNode("social_strategist", social.socialStrategistNode)
    .addNode("social_generator", social.socialPostGeneratorNode)
    .addNode("social_reviewer", social.socialReviewerNode)

    // ── Paid Ads Pipeline Nodes ──
    .addNode("ad_researcher", ads.adResearcherNode)
    .addNode("ad_copywriter", ads.adCopywriterNode)
    .addNode("ad_reviewer", ads.adReviewerNode)

    // ── Email Marketing Pipeline Nodes ──
    .addNode("email_strategist", email.emailStrategistNode)
    .addNode("email_writer", email.emailWriterNode)
    .addNode("email_reviewer", email.emailReviewerNode)

    // ── Analytics & Reporting Node ──
    .addNode("campaign_analyzer", analytics.campaignAnalyzerNode);

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 1: SEO (with strict review loop)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge(START, "seo_researcher");
  workflow.addEdge("seo_researcher", "seo_strategist");
  workflow.addEdge("seo_strategist", "seo_writer");
  workflow.addEdge("seo_writer", "seo_reviewer");

  workflow.addConditionalEdges("seo_reviewer", (state: typeof CampaignState.State) => {
    if (state.seoIsApproved) return "seo_publisher";
    if (state.seoRevisionCount >= 3) {
      console.log("   ⚠️  [SEO] Max revisions reached. Forcing publish.");
      return "seo_publisher";
    }
    return "seo_writer";
  });

  // After SEO publishes → start Blog + Social + Ads + Email in sequence
  workflow.addEdge("seo_publisher", "blog_planner");

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 2: BLOG (with strict review loop)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge("blog_planner", "blog_writer");
  workflow.addEdge("blog_writer", "blog_reviewer");

  workflow.addConditionalEdges("blog_reviewer", (state: typeof CampaignState.State) => {
    if (state.blogIsApproved) return "blog_meta";
    if (state.blogRevisionCount >= 3) {
      console.log("   ⚠️  [Blog] Max revisions reached. Proceeding.");
      return "blog_meta";
    }
    return "blog_writer";
  });

  // After Blog meta → Social Media
  workflow.addEdge("blog_meta", "social_strategist");

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 3: SOCIAL MEDIA (with strict review loop)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge("social_strategist", "social_generator");
  workflow.addEdge("social_generator", "social_reviewer");

  workflow.addConditionalEdges("social_reviewer", (state: typeof CampaignState.State) => {
    if (state.socialIsApproved) return "ad_researcher";
    if (state.socialRevisionCount >= 3) {
      console.log("   ⚠️  [Social] Max revisions reached. Proceeding.");
      return "ad_researcher";
    }
    return "social_generator";
  });

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 4: PAID ADS (with strict review loop)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge("ad_researcher", "ad_copywriter");
  workflow.addEdge("ad_copywriter", "ad_reviewer");

  workflow.addConditionalEdges("ad_reviewer", (state: typeof CampaignState.State) => {
    if (state.adIsApproved) return "email_strategist";
    if (state.adRevisionCount >= 3) {
      console.log("   ⚠️  [Ads] Max revisions reached. Proceeding.");
      return "email_strategist";
    }
    return "ad_copywriter";
  });

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 5: EMAIL MARKETING (with strict review loop)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge("email_strategist", "email_writer");
  workflow.addEdge("email_writer", "email_reviewer");

  workflow.addConditionalEdges("email_reviewer", (state: typeof CampaignState.State) => {
    if (state.emailIsApproved) return "campaign_analyzer";
    if (state.emailRevisionCount >= 3) {
      console.log("   ⚠️  [Email] Max revisions reached. Proceeding.");
      return "campaign_analyzer";
    }
    return "email_writer";
  });

  // ═══════════════════════════════════════════════════════════
  // PIPELINE 6: ANALYTICS (final step)
  // ═══════════════════════════════════════════════════════════
  workflow.addEdge("campaign_analyzer", END);

  return workflow.compile();
};
