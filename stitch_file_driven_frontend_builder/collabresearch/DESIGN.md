---
name: CollabResearch
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#40484c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#71787c'
  outline-variant: '#c0c8cc'
  surface-tint: '#2f6579'
  primary: '#003342'
  on-primary: '#ffffff'
  primary-container: '#0d4b5e'
  on-primary-container: '#86bad0'
  inverse-primary: '#9acee5'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e1'
  on-secondary-container: '#606364'
  tertiary: '#003723'
  on-tertiary: '#ffffff'
  tertiary-container: '#005035'
  on-tertiary-container: '#33ca91'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeaff'
  primary-fixed-dim: '#9acee5'
  on-primary-fixed: '#001f29'
  on-primary-fixed-variant: '#104d60'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c4c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#444748'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  agent-planner: '#6366F1'
  agent-researcher-a: '#0EA5E9'
  agent-researcher-b: '#8B5CF6'
  agent-fact-checker: '#F59E0B'
  agent-writer: '#EC4899'
  agent-editor: '#10B981'
  surface-border: '#E2E8F0'
  report-bg: '#FFFFFF'
typography:
  report-h1:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  report-h2:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  report-body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  chat-bubble:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  status-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  report-h1-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  report-max-width: 700px
  gutter: 1rem
  margin-sm: 1rem
  margin-md: 2rem
  stack-gap: 0.75rem
  log-indent: 2.5rem
---

## Brand & Style

The design system is engineered for **CollabResearch**, an academic-grade AI multi-agent platform. The brand personality is authoritative, precise, and intellectually rigorous, targeting students, researchers, and professional analysts who require high-fidelity output.

The visual style is **Corporate / Modern** with a strong leaning toward **Minimalism**. It prioritizes a high signal-to-noise ratio, utilizing expansive white space to reduce cognitive load during complex research tasks. The aesthetic avoids "playful" consumer trends in favor of a structured, systematic interface that evokes the feeling of a digital laboratory or a modern library.

Key characteristics include:
- **Functional Transparency:** The "system log" styling for agents makes the AI's "thought process" visible and trustworthy.
- **Academic Utility:** High-contrast typography and generous line heights ensure that long-form reports are comfortable for deep reading.
- **The Relay Effect:** A subtle color-coded system tracks the handoff between agents, creating a sense of momentum and collaborative progress.

## Colors

The palette is anchored by a **Deep Teal** primary color, chosen for its association with stability and depth. The background is a crisp, near-white gray to provide a neutral canvas for data-heavy content.

### Agent Color System
To facilitate rapid visual tracking of the multi-agent pipeline, six distinct hues are assigned to specific roles. These colors should be used sparingly—only for icons, names in status logs, and thin progress indicators:
- **Planner:** Indigo (Strategy & Structure)
- **Researcher A:** Sky Blue (Discovery & Sourcing)
- **Researcher B:** Violet (Deep Analysis)
- **Fact-Checker:** Amber (Caution & Verification)
- **Writer:** Pink (Creative Synthesis)
- **Editor:** Emerald (Approval & Refinement)

A secondary **Success Green** is reserved exclusively for "Approved" badges and final report confirmations to provide clear terminal feedback.

## Typography

The typography strategy balances modern interface needs with long-form readability. 

- **Interface & Headlines:** **Hanken Grotesk** is used for its sharp, contemporary terminals and professional weight, lending the product a sophisticated "SaaS" feel.
- **Body & Reports:** **Inter** is the workhorse font, providing exceptional legibility across screen sizes. For the final research reports, line heights are intentionally increased to 1.75x (28px) to prevent reader fatigue.
- **System Logs:** **JetBrains Mono** is utilized for agent status rows and timestamps. This monospaced choice reinforces the "technical/data-driven" nature of the agent handoffs.

## Layout & Spacing

The design system employs a **Fluid Grid** for the chat container but switches to a **Fixed Content Width** for the research reports.

### Layout Principles
- **Report Focus:** Final reports are centered with a `700px` maximum width. This "reading mode" ensures line lengths remain within the optimal 45–75 character range for academic reading.
- **The Log Stack:** Agent status messages are stacked with a tight `0.75rem` gap to distinguish them from the larger chat bubbles. They should be slightly indented or visually separated to feel like a chronological feed.
- **Responsive Reflow:** On mobile, margins reduce from `2rem` to `1rem`, and report font sizes scale down. The input bar remains sticky at the bottom, ensuring the "send" action is always within thumb-reach.

## Elevation & Depth

This design system avoids heavy shadows, instead using **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

- **Level 0 (Background):** Solid `#F8FAFB`.
- **Level 1 (Chat Bubbles):** Pure white background with a subtle `1px` border in `#E2E8F0`. 
- **Level 2 (Input Bar & Header):** Fixed positioning with a very soft, high-diffusion shadow (`0 4px 12px rgba(0,0,0,0.05)`) or a backdrop-blur (glassmorphism) to indicate they float above the scrollable content.
- **Level 3 (Interactive Chips):** Files and "Download" buttons use a slightly deeper surface color or a subtle inner-glow to feel "pressable."

Depth is primarily communicated through color-blocking rather than physical extrusion.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness profile to maintain a professional, slightly architectural look. 

- **Status Pills:** Use a full "Pill" radius to distinguish system events from content.
- **Chat Bubbles:** Use a `0.5rem` (rounded-lg) radius to feel approachable but clean.
- **Input Fields:** Use a `0.25rem` radius to match the academic/professional tone.
- **Buttons:** Primary buttons for "Download Report" should use the same `0.25rem` radius for a disciplined, sharp appearance.

## Components

### Agent Status Row
A specialized component that is not a chat bubble. It consists of a small icon (colored by agent role), a title (e.g., "Planner"), and a status string. For "Working" states, a 2px pulsing dot is used. For "Handoff" states, a small right-arrow icon connects the two agent names.

### Final Report Bubble
This is the "hero" component. It must be visually broader than standard messages. It features a top-aligned emerald badge ("Approved by Editor"). The Markdown content inside must strictly follow the defined `report-body` and `report-h1/h2` typography.

### File Chips
When a file is attached (PDF, DOCX), it appears as a small rectangular chip with a `1px` border. It includes a file-type icon, the truncated filename, and a "close" icon for removal before sending.

### Message Input
A clean, single-line text area that expands up to 5 lines. The "paperclip" icon and "send" button are positioned at the ends of the container. The container itself should have a white background and a clear `1px` border, floating above the message history with a subtle backdrop-blur effect.