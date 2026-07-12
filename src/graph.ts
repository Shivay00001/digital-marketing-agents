import { StateGraph, END, START } from "@langchain/langgraph";
import { CampaignState } from "./state";
import { createNodes } from "./nodes";
import { ChatOpenAI } from "@langchain/openai";

export const buildGraph = (llm: ChatOpenAI) => {
  const nodes = createNodes(llm);
  
  const workflow = new StateGraph(CampaignState)
    .addNode("researcher", nodes.researcherNode)
    .addNode("strategist", nodes.strategistNode)
    .addNode("writer", nodes.writerNode)
    .addNode("reviewer", nodes.reviewerNode)
    .addNode("publisher", nodes.publisherNode);
    
  workflow.addEdge(START, "researcher");
  workflow.addEdge("researcher", "strategist");
  workflow.addEdge("strategist", "writer");
  workflow.addEdge("writer", "reviewer");
  
  // Strict Conditional Edge for Reviewer Loop
  workflow.addConditionalEdges("reviewer", (state: typeof CampaignState.State) => {
    if (state.isApproved) {
      return "publisher";
    }
    // Fail safe to prevent infinite loops (max 3 revisions)
    if (state.revisionCount >= 3) {
      console.log("⚠️  [System] Max revisions reached. Forcing publish.");
      return "publisher";
    }
    return "writer"; // Loop back to writer with feedback
  });
  
  workflow.addEdge("publisher", END);
  
  return workflow.compile();
};
