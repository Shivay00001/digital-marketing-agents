import { Annotation } from "@langchain/langgraph";

// Define the Strict State structure for the Campaign
export const CampaignState = Annotation.Root({
  keyword: Annotation<string>(),
  serpData: Annotation<string>(),
  semanticKeywords: Annotation<string[]>(),
  seoBrief: Annotation<string>(),
  contentDraft: Annotation<string>(),
  reviewFeedback: Annotation<string>(),
  isApproved: Annotation<boolean>(),
  publishedUrl: Annotation<string>(),
  revisionCount: Annotation<number>(),
});
