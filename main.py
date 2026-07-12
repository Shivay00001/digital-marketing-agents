from crewai import Task, Crew, Process
from agents.marketing_agents import MarketingAgents
import os
from dotenv import load_dotenv

load_dotenv()

# Check for API keys
if not os.environ.get("OPENAI_API_KEY") and not os.environ.get("GEMINI_API_KEY"):
    print("WARNING: No LLM API key found in .env. CrewAI requires an LLM to run.")
    print("Please add OPENAI_API_KEY or GEMINI_API_KEY to your .env file.")

def run_marketing_crew(target_keyword: str, brand_name: str):
    print(f"--- Starting Digital Marketing Campaign for: {brand_name} ---")
    print(f"--- Target Keyword: {target_keyword} ---")

    agents = MarketingAgents()
    
    # Initialize Agents
    cmo = agents.cmo_agent()
    seo = agents.seo_mastermind_agent()
    writer = agents.content_writer_agent()

    # Define Tasks
    planning_task = Task(
        description=f"Analyze the brand '{brand_name}' and the target keyword '{target_keyword}'. Create a high-level marketing brief and delegate the SEO analysis to the SEO Mastermind.",
        expected_output="A high-level digital marketing strategy brief.",
        agent=cmo
    )

    seo_strategy_task = Task(
        description=f"Use your tools to analyze the SERP for '{target_keyword}'. Extract LSI/TF-IDF keywords. Create a strict, data-driven content outline for the writer. You MUST guarantee this outline is mathematically designed to outrank the top 3 competitors.",
        expected_output="A highly detailed SEO content brief containing exact headings, required semantic keywords, and search intent guidelines.",
        agent=seo
    )

    content_writing_task = Task(
        description="Take the SEO brief and write a 1500+ word masterpiece. Ensure it is highly engaging, passes AI detection naturally, and follows every single SEO directive provided.",
        expected_output="A polished, HTML-formatted blog post ready for publishing.",
        agent=writer
    )
    
    indexing_task = Task(
        description="Simulate the publishing of the article and trigger the Google Indexing API to ensure lightning-fast indexing.",
        expected_output="Confirmation that the URL has been submitted to Google Search Console.",
        agent=seo
    )

    # Assemble the Crew
    crew = Crew(
        agents=[cmo, seo, writer],
        tasks=[planning_task, seo_strategy_task, content_writing_task, indexing_task],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()
    
    print("\n\n######################")
    print("## CAMPAIGN RESULTS ##")
    print("######################\n")
    print(result)

if __name__ == "__main__":
    # Example Run
    run_marketing_crew("Best AI Tools for Marketing Automation", "EnterChat Marketing")
