# 🚀 Multi-Agent AI Digital Marketing System

A **production-grade, all-in-one Multi-Agent AI system** that automates every aspect of digital marketing. Powered by **TypeScript**, **LangChain.js**, and **LangGraph StateGraph** architecture with strict monitoring and review loops.

## 🧠 About

This is not a simple chatbot wrapper. This system deploys **6 specialized AI agents**, each with their own StateGraph pipeline and strict quality review loops. A **Master Coordinator** orchestrates all agents from a single campaign brief, producing publication-ready content across every marketing channel.

Every agent features a **Strict Reviewer Node** that algorithmically validates outputs against specific criteria. Content that fails review is automatically sent back for revision (up to 3 times) before proceeding.

## 🤖 The 6 Agent Pipelines

| Agent | What It Does | Nodes |
|---|---|---|
| 🔍 **SEO Agent** | Live SERP scraping, TF-IDF semantic analysis, LSI keyword extraction, SEO content writing, Google Indexing API | Researcher → Strategist → Writer → Reviewer ↺ → Publisher |
| 📝 **Blog Agent** | Full blog posts with meta tags, Open Graph, JSON-LD schema markup, readability scoring | Planner → Writer → Reviewer ↺ → Meta Generator |
| 📱 **Social Media Agent** | Platform-specific posts for Twitter/X, LinkedIn, Instagram, Facebook with hashtags, emojis, optimal char limits | Strategist → Post Generator → Reviewer ↺ |
| 💰 **Paid Ads Agent** | Google Ads (RSA format) & Facebook/Meta Ads copy with A/B variants, negative keywords, CTR optimization | Researcher → Copywriter → Reviewer ↺ |
| 📧 **Email Marketing Agent** | Email campaigns with 5 subject line variants, PAS framework body, CTA buttons, A/B testing | Strategist → Writer → Reviewer ↺ |
| 📊 **Analytics Agent** | Comprehensive campaign report analyzing all 5 channel outputs with scores, predictions, and recommendations | Campaign Analyzer |

## 🏗️ Architecture

```
Campaign Brief (keyword + business info)
        │
        ▼
┌─────────────────────────┐
│   MASTER COORDINATOR    │
│   (StateGraph Engine)   │
└─────────┬───────────────┘
          │
    ┌─────┼─────┬─────┬─────┬─────┐
    ▼     ▼     ▼     ▼     ▼     ▼
  [SEO] [Blog] [Social] [Ads] [Email] [Analytics]
    │     │      │       │      │        │
    ▼     ▼      ▼       ▼      ▼        ▼
  Each has its own Strict Review Loop (↺)
    │     │      │       │      │        │
    └─────┴──────┴───────┴──────┴────────┘
                    │
                    ▼
         📊 Campaign Report (Score /100)
```

## ⚡ Features

- **Multiple LLM Support**: GPT4Free (free default), OpenAI, Groq — switch via `.env`
- **Live Web Scraping**: Real SERP data from DuckDuckGo, competitor page analysis
- **Mathematical NLP**: TF-IDF algorithm for scientifically extracting LSI keywords
- **Strict Review Loops**: Every agent has a reviewer that rejects bad output (max 3 revisions)
- **Google Indexing API**: Auto-submit published URLs for immediate crawling
- **Platform-Aware**: Character limits enforced for Twitter (280), Google Ads (30/90), etc.
- **A/B Testing Built-In**: Multiple variants for ads, emails, and subject lines

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your campaign details and LLM provider
```

### 3. Start the Free LLM Server (if using gpt4free)
```bash
pip install -U g4f[all]
g4f api
```

### 4. Run the Full Campaign
```bash
npm start
```

## 📁 Project Structure

```
src/
├── index.ts                 # Master entry point
├── state.ts                 # Shared campaign state (all 6 agents)
├── llmFactory.ts            # Multi-provider LLM factory
├── graphs/
│   └── masterGraph.ts       # Master orchestrator (connects all pipelines)
├── nodes/
│   ├── seoNodes.ts          # SEO agent nodes
│   ├── blogNodes.ts         # Blog agent nodes
│   ├── socialNodes.ts       # Social media agent nodes
│   ├── adNodes.ts           # Paid ads agent nodes
│   ├── emailNodes.ts        # Email marketing agent nodes
│   └── analyticsNodes.ts    # Analytics & reporting nodes
└── tools/
    ├── seoTools.ts          # SERP scraper, TF-IDF, Google Indexing API
    ├── socialTools.ts       # Hashtag research, platform validator
    └── adTools.ts           # Google Ads validator, negative keywords
```

## 🔧 Configuration

Set these in your `.env` file:

| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | LLM provider to use | `gpt4free` |
| `TARGET_KEYWORD` | Primary campaign keyword | `AI Automation for Digital Marketing` |
| `BUSINESS_NAME` | Your business name | `MarketingAI Pro` |
| `BUSINESS_DESC` | Business description | Auto-generated |
| `TARGET_AUDIENCE` | Target audience description | Auto-generated |

## 📄 License

MIT
