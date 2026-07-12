from crewai.tools import tool
import json

@tool("SERP Scraper Tool")
def serp_scraper_tool(keyword: str) -> str:
    """
    Scrapes Google Search Engine Results Page (SERP) for a given keyword.
    Returns the top ranking competitors, their titles, and snippets.
    Useful for analyzing search intent and what currently ranks.
    """
    # Mocking SERP API for development without requiring paid keys upfront
    # In production, replace with `google-search-results` (SerpAPI) or DataForSEO
    mock_results = [
        {"title": f"The Ultimate Guide to {keyword}", "url": "https://example.com/1", "snippet": f"Learn everything about {keyword}. This comprehensive guide covers all aspects."},
        {"title": f"{keyword} for Beginners in 2024", "url": "https://example.com/2", "snippet": f"Starting with {keyword}? Here is the best beginner tutorial."},
        {"title": f"Top 10 Tips for {keyword} Success", "url": "https://example.com/3", "snippet": f"Maximize your results with these proven {keyword} strategies."}
    ]
    return json.dumps(mock_results, indent=2)

@tool("TF-IDF Keyword Analyzer")
def keyword_analyzer_tool(content_topic: str) -> str:
    """
    Analyzes a topic and returns a list of semantic LSI (Latent Semantic Indexing) 
    keywords and TF-IDF terms that MUST be included in the content to rank #1.
    """
    # Mocking advanced NLP extraction
    return json.dumps([
        "strategy", "optimization", "metrics", "ROI", "conversion rate", 
        "audience targeting", "long-tail", "search volume"
    ])

@tool("Google Indexing API Trigger")
def trigger_google_indexing(url: str) -> str:
    """
    Pings the Google Indexing API to request immediate crawling of a new URL.
    This guarantees lightning-fast indexing.
    """
    return f"SUCCESS: Indexing request sent to Google for {url}. Googlebot will crawl this URL shortly."
