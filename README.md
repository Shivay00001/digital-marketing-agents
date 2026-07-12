# 🚀 Digital Marketing Agents (Strict Monitoring Edition)

A powerful, production-grade Multi-Agent AI system built to absolutely dominate digital marketing and SEO. Powered by **TypeScript**, **LangChain.js**, and **LangGraph**, this system leverages advanced state machine architecture to guarantee mathematically perfect content output.

## 🌟 About
This project implements a highly advanced **StateGraph** architecture. It doesn't just rely on basic LLM prompting; it features a dedicated **Strict Reviewer Node** that acts as an algorithmic monitor. 
- It live-scrapes search engines for competitor SERPs.
- It extracts LSI and TF-IDF semantic keywords using NLP.
- It drafts human-like content.
- **The Reviewer Loop**: Content cannot proceed until it mathematically proves all LSI keywords and intent guidelines are perfectly met. If it fails, it is sent back for a rewrite.

## ⚙️ Features
- **Multiple LLM Support**: Defaults to free LLMs (via `gpt4free`) but easily hooks into OpenAI, Groq, or Gemini.
- **Live Search & NLP**: Scrapes live search results and performs real TF-IDF analysis using `natural` and `cheerio`.
- **Google Indexing API**: Directly pings Google to index newly published content for lightning-fast ranking.

## 🚀 Getting Started

### 1. Installation
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and set your preferred provider:
```env
LLM_PROVIDER=gpt4free
G4F_BASE_URL=http://127.0.0.1:1337/v1
# OPENAI_API_KEY=your_key
# GROQ_API_KEY=your_key
```

### 3. Run the System
To run using `gpt4free`, ensure the python local server is running (`g4f api`). Then execute:
```bash
npm start
```
