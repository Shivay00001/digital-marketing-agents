import { Annotation } from "@langchain/langgraph";

// ═══════════════════════════════════════════════════════════
// COMPLETE MULTI-AGENT CAMPAIGN STATE
// Central state structure shared across ALL 6 agent pipelines
// ═══════════════════════════════════════════════════════════

export const CampaignState = Annotation.Root({
  // ── Campaign Input ──
  keyword: Annotation<string>(),
  businessName: Annotation<string>(),
  businessDescription: Annotation<string>(),
  targetAudience: Annotation<string>(),

  // ── SEO Agent Outputs ──
  serpData: Annotation<string>(),
  semanticKeywords: Annotation<string[]>(),
  seoBrief: Annotation<string>(),
  seoContentDraft: Annotation<string>(),
  seoReviewFeedback: Annotation<string>(),
  seoIsApproved: Annotation<boolean>(),
  seoRevisionCount: Annotation<number>(),
  seoPublishedUrl: Annotation<string>(),

  // ── Blog Agent Outputs ──
  blogOutline: Annotation<string>(),
  blogDraft: Annotation<string>(),
  blogMetaTags: Annotation<string>(),
  blogSchemaMarkup: Annotation<string>(),
  blogReviewFeedback: Annotation<string>(),
  blogIsApproved: Annotation<boolean>(),
  blogRevisionCount: Annotation<number>(),

  // ── Social Media Agent Outputs ──
  socialStrategy: Annotation<string>(),
  twitterPost: Annotation<string>(),
  linkedinPost: Annotation<string>(),
  instagramCaption: Annotation<string>(),
  facebookPost: Annotation<string>(),
  hashtags: Annotation<string[]>(),
  socialReviewFeedback: Annotation<string>(),
  socialIsApproved: Annotation<boolean>(),
  socialRevisionCount: Annotation<number>(),

  // ── Paid Ads Agent Outputs ──
  adResearch: Annotation<string>(),
  googleAdsVariants: Annotation<string>(),
  facebookAdsVariants: Annotation<string>(),
  negativeKeywords: Annotation<string[]>(),
  adReviewFeedback: Annotation<string>(),
  adIsApproved: Annotation<boolean>(),
  adRevisionCount: Annotation<number>(),

  // ── Email Marketing Agent Outputs ──
  emailStrategy: Annotation<string>(),
  emailSubjectLines: Annotation<string[]>(),
  emailBody: Annotation<string>(),
  emailCtaVariants: Annotation<string[]>(),
  emailReviewFeedback: Annotation<string>(),
  emailIsApproved: Annotation<boolean>(),
  emailRevisionCount: Annotation<number>(),

  // ── Analytics & Reporting Agent Outputs ──
  campaignReport: Annotation<string>(),
  overallScore: Annotation<number>(),
});
