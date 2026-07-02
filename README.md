# CONSENSUS: Multi-Agent AI Investment Research Platform

Welcome to **CONSENSUS**, an intelligent investment research platform that simulates a professional investment committee to analyze stocks. Instead of relying on a single AI prompt, CONSENSUS uses a team of specialized AI agents that research, debate, and verify information before delivering a final consensus recommendation.

---

## Project Download & Links

- **Direct ZIP Download Link**: [Download CONSENSUS Project ZIP](https://github.com/sahilkr28/CONSENSUS/archive/refs/heads/main.zip) (Publicly Accessible)
- **GitHub Repository**: [sahilkr28/CONSENSUS](https://github.com/sahilkr28/CONSENSUS)
- **Vercel link**: consensus-umber.vercel.app

---

## Overview — What it Does

CONSENSUS acts as an AI-powered Chief Investment Officer (CIO) and Research Committee:
1. **Parallel Research**: It dispatches four specialized analyst agents in parallel to check a company's **Financial Health**, **Business Moat**, **News Sentiment**, and **Market Position** using live APIs (Yahoo Finance, NewsAPI, and Tavily).
2. **Evidence Vault**: It gathers all retrieved facts, removes duplicates, and stores them in a secure evidence vault with trackable IDs (`ev-1`, `ev-2`).
3. **Committee Debate**: A **Bull Committee** and **Bear Committee** evaluate the evidence. They build the strongest positive and negative arguments, assign their own confidence scores, and determine recommendations.
4. **Chairperson Decision**: The Chairperson (acting as the CIO) reviews the debate, flags any contradictions, lists missing information, and outputs a final consensus verdict (**BUY**, **HOLD**, or **SELL**) with a detailed reasoning explanation.
5. **Confidence Breakdown**: Explains dynamically why the confidence score is at its current level (e.g. subtracting points for missing news, low source reliability, or conflicting analyst viewpoints).

---

##  How to Run It — Setup and Run Steps

Follow these simple steps to run CONSENSUS on your local machine:

### 1. Prerequisites
Ensure you have **Node.js** (version 18 or later) installed.

### 2. Download and Install
Extract the downloaded ZIP folder, open your terminal inside the project directory, and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a file named `.env.local` in the root folder of the project and add the following keys:
```env
# Gemini API Key for AI Agents
GEMINI_API_KEY=your_gemini_api_key

# News API Key for news sentiment headlines (from newsapi.org)
NEWS_API_KEY=your_news_api_key

# Tavily Search API Key for market research (from tavily.com)
TAVILY_API_KEY=your_tavily_api_key

# Public App Brand Name
NEXT_PUBLIC_APP_NAME=CONSENSUS

# Credentials for logging into the dashboard (Defaults to: shane / 86077ar)
AUTH_USERNAME=shane
AUTH_PASSWORD=86077ar

# (Optional) Upstash Redis Configuration for caching (prevents duplicate API calls)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 4. Run the Platform
Start the local development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. Log in using your configured credentials (default: username `shane` and password `86077ar`) to start researching stocks.

---

## How it Works — Approach and Architecture

CONSENSUS is built using a **Clean Architecture** layout:

```
[User Interface (Next.js 15)]
         │
         ▼
[API Routes & Cache Layer]
         │
         ▼
[LangGraph Orchestration] ──► [Specialized Agents (Gemini)]
         │
         ▼
[Evidence Collector] ─────► [Bull / Bear / Risk Debater Nodes]
         │
         ▼
[Judge CIO Verdict] ──────► [Consensus Weighted Score Engine]
```

### Flow breakdown:
- **LangGraph.js State Management**: We represent the workflow as a graph where each agent node executes in order, passing structured data to the next node.
- **Parallel Execution**: Coordinator dispatches Financial, Moat, News, and Market tasks simultaneously to reduce user wait times.
- **Deduplicated Evidence**: The central collector matches claims against source URLs and citations, preventing the LLM from fabricating facts.
- **Consensus Calculation**: The final score is mathematically calculated:
  `Financial (30%) + Business (20%) + News (15%) + Market (10%) + Bull Case (10%) + Bear Case (10%) + Risk (5%)`.
  It automatically deducts confidence points for contradictions and missing details flagged by the CIO.

---

## Key Decisions & Trade-Offs

### 1. What We Chose and Why:
- **Gemini 2.5 Flash / Gemini 1.5 Pro**: We selected Gemini for its speed, high context windows, and native Zod schema support for structured JSON parsing.
- **LangGraph.js over LangChain Chains**: LangGraph allows us to define clear execution flows, coordinate parallel tasks, and trace state step-by-step.
- **In-Memory & Redis Hybrid Cache**: If Upstash keys aren't set, the app falls back to in-memory caching. This keeps setup fast for local testing while remaining production-grade.
- **Clean Dark Theme UI**: We used Next.js and Tailwind CSS with custom cards to build a professional dark-themed research dashboard.

### 2. What We Left Out (Trade-offs):
- **Live Trading Integration**: To keep the platform focused purely on research and risk analysis, we did not add actual trading actions.
- **Permanent Database Storage**: We relied on caching rather than a permanent database (like MongoDB or PostgreSQL) to keep setup trivial for developers.

---

## Example Runs

Below are summaries of how the AI committee analyzed two different stocks:

### 1. Apple Inc. ($AAPL)
- **Consensus Score**: 85/100
- **CIO Verdict**: **BUY** (Confidence: 80%)
- **Bull Case**: Robust services revenue growth, very high free cash flow generation, and a wide economic moat.
- **Bear Case**: Slowing hardware sales and premium stock valuation.
- **Chairperson Summary**: The final consensus favored the Bull Committee due to Apple's dominant cash flows and ecosystem strength outweighing valuation premiums.

### 2. Tesla Inc. ($TSLA)
- **Consensus Score**: 62/100
- **CIO Verdict**: **HOLD** (Confidence: 65%)
- **Bull Case**: Global leadership in electric vehicles, strong cash positions, and energy storage growth.
- **Bear Case**: Pricing pressure, declining margins, and regulatory uncertainties.
- **Chairperson Summary**: The committee chose a neutral HOLD stance because the EV margin contraction and regulatory risks offset the company's market leadership.

---

## What We Would Improve With More Time

1. **PDF Earnings Reports Upload**: Let users upload custom PDFs (like SEC 10-K filings or earnings reports) for the AI agents to parse.
2. **Detailed Financial Charts**: Add historical graphs for debt-to-equity ratios, profit margins, and EPS over the last 5 years.
3. **PDF Export**: Generate downloadable, professionally formatted PDF summaries of the committee's final debate and report.

---

## LLM Chat Session Transcript & Logs (Bonus Points)

During the development of this project, we pair-programmed and chatted with the Gemini 3.5 Flash assistant. You can view the full transcript of this conversation to understand our thought process and implementation steps.

- **Conversation Transcript Path**: 
  - Token-efficient log: [transcript.jsonl](file:///C:/Users/Piyush/.gemini/antigravity-ide/brain/5a6053f6-8e50-4147-906b-2f703e6f3c3f/.system_generated/logs/transcript.jsonl)
  - Full detailed logs: [transcript_full.jsonl](file:///C:/Users/Piyush/.gemini/antigravity-ide/brain/5a6053f6-8e50-4147-906b-2f703e6f3c3f/.system_generated/logs/transcript_full.jsonl)
- **Visual Walkthrough & Verification Video**: [walkthrough.md](file:///C:/Users/Piyush/.gemini/antigravity-ide/brain/5a6053f6-8e50-4147-906b-2f703e6f3c3f/walkthrough.md)
