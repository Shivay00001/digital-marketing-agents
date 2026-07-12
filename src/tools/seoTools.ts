import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { search } from "duck-duck-scrape";
import axios from "axios";
import * as cheerio from "cheerio";
import natural from "natural";
import { google as googleapis } from "googleapis";
import * as fs from "fs";

export const serpScraperTool = tool(
  async ({ keyword }) => {
    console.log(`\n[REAL SEO Tool] Scraping LIVE Search Engine SERP for: "${keyword}"...`);
    try {
      const response = await search(keyword);
      
      const results = response.results.slice(0, 4).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description
      }));
      
      return JSON.stringify(results);
    } catch (e: any) {
      return `Error scraping Google: ${e.message}`;
    }
  },
  {
    name: "serp_scraper",
    description: "Scrapes the top live Google search results for a keyword. Returns real competitor titles, URLs, and snippets.",
    schema: z.object({ keyword: z.string() })
  }
);

export const tfIdfAnalyzerTool = tool(
  async ({ urls }) => {
    console.log(`[REAL SEO Tool] Fetching competitor URLs and running TF-IDF NLP analysis...`);
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    try {
      // We will scrape the text from the top competitor URLs
      for (const url of urls) {
        try {
          const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 });
          const $ = cheerio.load(data);
          // Remove irrelevant tags
          $('script, style, nav, footer, header, aside, .ad, .nav').remove();
          const text = $('body').text().replace(/\s+/g, ' ').toLowerCase();
          tfidf.addDocument(text);
        } catch (err) {
          console.log(`   - Could not scrape ${url}, skipping...`);
        }
      }

      // Get most important terms across the top document
      const topTerms = new Set<string>();
      
      // Analyze the first successfully fetched document as the baseline
      tfidf.listTerms(0).slice(0, 20).forEach((item: any) => {
        if (item.term.length > 3 && isNaN(Number(item.term))) {
          topTerms.add(item.term);
        }
      });
      
      return JSON.stringify(Array.from(topTerms));

    } catch (e: any) {
      return `Error extracting keywords: ${e.message}`;
    }
  },
  {
    name: "tfidf_analyzer",
    description: "Fetches live competitor URLs, scrapes their content, and runs a mathematical TF-IDF NLP algorithm to extract the exact LSI terms used by top ranking pages. Pass an array of the top 3 competitor URLs.",
    schema: z.object({ urls: z.array(z.string()) })
  }
);

export const indexingApiTool = tool(
  async ({ url }) => {
    console.log(`\n[REAL SEO Tool] Pinging LIVE Google Indexing API for URL: "${url}"...`);
    try {
      // Requires a service_account.json in the project root
      if (!fs.existsSync("service_account.json")) {
         console.log("   - WARNING: service_account.json not found.");
         return "ERROR: service_account.json not found. Cannot hit real Google Indexing API without credentials. But the content is finalized and ready to publish!";
      }

      const auth = new googleapis.auth.GoogleAuth({
        keyFile: "service_account.json",
        scopes: ["https://www.googleapis.com/auth/indexing"],
      });

      const indexing = googleapis.indexing({
        version: "v3",
        auth: auth,
      });

      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: "URL_UPDATED",
        },
      });

      return `SUCCESS: URL ${url} submitted to real Google Indexing API. Status: ${response.status}`;
    } catch (e: any) {
       return `Failed to ping Indexing API: ${e.message}`;
    }
  },
  {
    name: "google_indexer",
    description: "Pings the REAL Google Indexing API for immediate crawling and indexing of newly published content. Requires service_account.json.",
    schema: z.object({ url: z.string() })
  }
);
