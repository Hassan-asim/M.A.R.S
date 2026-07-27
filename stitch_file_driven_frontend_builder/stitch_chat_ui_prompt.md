# Stitch AI Prompt — CollabResearch Chat UI

Design a clean, modern **chat interface** for an app called **CollabResearch**, where a user talks to a team of AI research agents that plan, search the web, verify facts, write, and approve a research report together.

## Overall layout
- Classic chat app layout: scrollable message history filling the main area, an input bar fixed at the bottom
- Header bar at top: "CollabResearch" name + short tagline "Your AI research team — plan, search, verify, write, approve."

## Input bar (bottom, always visible)
- Text input: placeholder "Enter a research topic, or describe what you want expanded..."
- A paperclip/attach button that opens a file picker accepting .pdf, .docx, .md, .txt
- When a file is attached, show a small removable chip above the input bar with the filename and a file-type icon (before the user sends)
- Send button (disabled until there's text or a file)

## Message history — three distinct message types

**1. User message (right-aligned chat bubble)**
- Shows the topic/question text
- If a file was attached, shows a small file chip inside or below the bubble (filename + icon)

**2. Agent status messages (compact, left-aligned, NOT full-size bubbles)**
- Small pill/row style, distinct from full chat bubbles — think "system log" styling: small icon + short text + subtle timestamp
- Two states to visually distinguish:
  - **Working:** icon = spinner or pulsing dot, text like "🧭 Planner is breaking down your topic..."
  - **Handoff:** icon = arrow, text like "✅ Planner finished → handing off to Researcher A"
- Each of the 6 agents should have a distinct small icon/color so the user can visually track who's active: Planner, Researcher A, Researcher B, Fact-Checker, Writer, Editor
- These should stack chronologically like a live activity feed as the pipeline runs

**3. Final report message (full-width assistant chat bubble, visually distinct/larger than status messages)**
- Green badge at the top: "✅ Approved by Editor Agent"
- Rendered Markdown report body: clear heading hierarchy, comfortable reading width (~700px max), good paragraph spacing
- Collapsible "Sources" section below the report listing cited URLs
- "Download Report (.md)" button
- Timestamp

## Visual style
- Minimal, professional, research/academic feel — not playful or consumer-social
- Neutral background (white or very light gray), one accent color for buttons/badges/active-agent states (suggest deep blue or teal)
- The 6 agents each get a small distinct accent color used consistently in their status pills and any progress indicator, so the "handoff" visually reads as a relay
- Clear typographic hierarchy: app title > agent status text > body report text > captions/timestamps
- Fully responsive — must look clean on mobile (primary users are students on phones)

## Components needed as reusable pieces
- `ChatHeader`
- `MessageInputBar` (text input + file attach + chip preview + send button)
- `UserMessageBubble` (text + optional file chip)
- `AgentStatusRow` (icon, agent name/color, status text, working/handoff state)
- `FinalReportBubble` (approval badge, markdown body, sources list, download button)

## Technical notes for export
- Export as React functional components compatible with Next.js App Router
- Use plain CSS/Tailwind utility classes only — no CSS-in-JS libraries requiring extra setup
- No hardcoded report content, agent names, or file data — everything must be prop/state driven so it can be wired to a live streaming API response (the backend sends a sequence of status events, then a final report event)
- `AgentStatusRow` must support being rendered many times in sequence as new events arrive, not just once
