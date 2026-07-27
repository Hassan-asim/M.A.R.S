# 🚀 M.A.R.S — Multi-Agent Research System (CollabResearch)

**M.A.R.S** is a chat-based multi-agent research report generator built with **Next.js**, **Mastra agent orchestration**, **OpenRouter (free-tier models)**, and **Tavily web search**.

The user inputs a research topic and/or attaches a document (`.pdf`, `.docx`, `.md`, `.txt`). A team of **six specialized AI agents** collaborates live to analyze, search the web, fact-check, draft, and edit a cited Markdown report that expands on the user's material.

---

## 🌟 Key Features

- **6 Autonomous AI Agents**:
  1. **Planner Agent**: Analyzes topic & document, formulates 4-5 sub-questions.
  2. **Researcher A Agent**: Performs live web research on initial sub-questions.
  3. **Researcher B Agent**: Parallel web research on remaining sub-questions.
  4. **Fact-Checker Agent**: Cross-verifies researcher claims against user document.
  5. **Writer Agent**: Synthesizes fact-checked research into a structured report.
  6. **Senior Editor Agent**: Reviews, refines, and approves the final report.
- **Document Expansion**: Upload `.pdf`, `.docx`, `.md`, or `.txt` notes/drafts to expand upon existing material with fresh web research.
- **Live Handoff Streaming**: Real-time server-sent event (SSE) updates in the chat UI showing agent status and step transitions.
- **4 OpenRouter Key Pool**: Automatically distributes requests across 4 distinct OpenRouter API keys with failover pool rotation to prevent rate limiting.
- **100% Free Tier Enforced**: Strictly calls models with `:free` suffixes (`meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-r1:free`, etc.) for zero paid usage.
- **Single Vercel Project**: Frontend UI + Edge API backend built and deployed as a unified Next.js application.

---

## 🏗️ Architecture & Pipeline Flow

```
Chat Interface (Next.js App Router)
       │  { topic: string, file?: File }
       ▼
POST /api/research  (Streaming SSE Route)
       │
       ├─► Document Extractor (Utility: pdf-parse / mammoth / plain text)
       │
       └─► 6-Agent Mastra Pipeline:
            ├─► 1. Planner Agent        [API Key 1] -> 4-5 sub-questions
            ├─► 2. Researcher A Agent   [API Key 2] -> Tavily search (Q1-Q2)
            ├─► 3. Researcher B Agent   [API Key 3] -> Tavily search (Q3-Q5)
            ├─► 4. Fact-Checker Agent   [API Key 1] -> Verify claims
            ├─► 5. Writer Agent         [API Key 4] -> Draft Markdown report
            └─► 6. Senior Editor Agent  [API Key 4] -> Approval / Revision
```

---

## 🔑 Environment Variables Setup

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Populate the required keys in `.env.local`:

```env
# OpenRouter API Keys (4 Keys distributed across the 6 research agents)
OPENROUTER_API_KEY_1=sk-or-v1-...
OPENROUTER_API_KEY_2=sk-or-v1-...
OPENROUTER_API_KEY_3=sk-or-v1-...
OPENROUTER_API_KEY_4=sk-or-v1-...

# Fallback Key
OPENROUTER_API_KEY=sk-or-v1-...

# Web Search (Tavily Free Tier)
TAVILY_API_KEY=tvly-...

# Site Information for OpenRouter headers
OPENROUTER_SITE_URL=https://mars-research.vercel.app
OPENROUTER_SITE_NAME=M.A.R.S
```

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production build check**:
   ```bash
   npm run build
   ```

---

## 🚀 Deploying to Vercel via GitHub

1. **Push your repository to GitHub**:
   ```bash
   git add .
   git commit -m "Complete M.A.R.S multi-agent research app"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your GitHub repository (`CollabResearch` / `mars-research`).

3. **Configure Environment Variables in Vercel**:
   - Add `OPENROUTER_API_KEY_1`, `OPENROUTER_API_KEY_2`, `OPENROUTER_API_KEY_3`, `OPENROUTER_API_KEY_4`.
   - Add `TAVILY_API_KEY`.
   - Add `OPENROUTER_SITE_URL` and `OPENROUTER_SITE_NAME`.

4. **Deploy**:
   Click **Deploy**. Vercel will build and deploy the Next.js app on a single serverless URL.

---

## 📄 License

MIT License. Built for precision multi-agent research.
