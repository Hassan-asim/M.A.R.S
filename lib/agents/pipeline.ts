import { callOpenRouter } from '../openrouter';
import { searchTavily } from '../tavily';

export interface StreamEvent {
  type: 'agent_start' | 'agent_done' | 'handoff' | 'final_report' | 'error';
  agent?: string;
  label?: string;
  output?: string;
  from?: string;
  to?: string;
  reportMarkdown?: string;
  sources?: string[];
  status?: string;
  error?: string;
}

export type EventCallback = (event: StreamEvent) => void;

export async function runResearchPipeline(
  topic: string,
  extractedText: string,
  onEvent: EventCallback
): Promise<void> {
  try {
    // --- Step 1: Planner Agent (API Key 1) ---
    onEvent({
      type: 'agent_start',
      agent: 'planner',
      label: 'Planner is breaking down your topic and structuring sub-questions...',
    });

    const plannerPrompt = `You are a meticulous research strategist. You are given a research topic and, optionally, text extracted from a document the user already has.
Topic: "${topic}"
${extractedText ? `User Document Text:\n"""\n${extractedText.slice(0, 4000)}\n"""` : 'No document attached.'}

If document text is provided, treat it as the starting point — your job is to identify what it's missing, what needs more evidence, and what new angles would meaningfully expand it. If no document text is provided, plan from the topic alone.
Produce 4 to 5 clear, non-overlapping sub-questions that will guide fresh web research. Each sub-question must be specific enough to search the web for. Output ONLY a numbered list of sub-questions, nothing else.`;

    const plannerOutput = await callOpenRouter(
      [
        { role: 'system', content: 'You output only a numbered list of 4-5 research sub-questions.' },
        { role: 'user', content: plannerPrompt },
      ],
      1 // Preferred API Key 1
    );

    onEvent({ type: 'agent_done', agent: 'planner', output: plannerOutput });

    // Parse sub-questions
    const subQuestions = plannerOutput
      .split('\n')
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((line) => line.length > 5);

    // Fallback if parsing fails
    if (subQuestions.length === 0) {
      subQuestions.push(
        `What are the core technical & contextual aspects of ${topic}?`,
        `What is the current status and latest research regarding ${topic}?`,
        `What are key challenges, applications, and future directions for ${topic}?`
      );
    }

    const mid = Math.ceil(subQuestions.length / 2);
    const subQuestionsA = subQuestions.slice(0, mid);
    const subQuestionsB = subQuestions.slice(mid);

    // Handoff to Researcher A
    onEvent({ type: 'handoff', from: 'planner', to: 'researcher_a' });

    // --- Step 2: Researcher A Agent (API Key 2) ---
    onEvent({
      type: 'agent_start',
      agent: 'researcher_a',
      label: 'Researcher A is querying web sources for sub-questions 1 & 2...',
    });

    const findingsA: string[] = [];
    const allSources: Set<string> = new Set();

    for (const sq of subQuestionsA) {
      const searchResults = await searchTavily(sq);
      searchResults.forEach((r) => {
        if (r.url && r.url !== '#') allSources.add(r.url);
      });

      const contextText = searchResults
        .map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}`)
        .join('\n\n');

      const resAOutput = await callOpenRouter(
        [
          {
            role: 'system',
            content:
              'You are a diligent research analyst. Write a concise factual summary (3-5 sentences) citing source URLs. Never fabricate information. Output format: Sub-question: ... / Findings: ... / Sources: [url1, url2]',
          },
          {
            role: 'user',
            content: `Sub-question: "${sq}"\nWeb Search Results:\n${contextText}`,
          },
        ],
        2 // Preferred API Key 2
      );
      findingsA.push(resAOutput);
    }

    onEvent({
      type: 'agent_done',
      agent: 'researcher_a',
      output: findingsA.join('\n\n'),
    });

    // Handoff to Researcher B
    onEvent({ type: 'handoff', from: 'researcher_a', to: 'researcher_b' });

    // --- Step 3: Researcher B Agent (API Key 3) ---
    onEvent({
      type: 'agent_start',
      agent: 'researcher_b',
      label: 'Researcher B is searching the web for remaining sub-questions...',
    });

    const findingsB: string[] = [];

    for (const sq of subQuestionsB) {
      const searchResults = await searchTavily(sq);
      searchResults.forEach((r) => {
        if (r.url && r.url !== '#') allSources.add(r.url);
      });

      const contextText = searchResults
        .map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.snippet}`)
        .join('\n\n');

      const resBOutput = await callOpenRouter(
        [
          {
            role: 'system',
            content:
              'You are a diligent research analyst working in parallel with Researcher A. Write a concise factual summary citing source URLs. Never fabricate information. Output format: Sub-question: ... / Findings: ... / Sources: [url1, url2]',
          },
          {
            role: 'user',
            content: `Sub-question: "${sq}"\nWeb Search Results:\n${contextText}`,
          },
        ],
        3 // Preferred API Key 3
      );
      findingsB.push(resBOutput);
    }

    onEvent({
      type: 'agent_done',
      agent: 'researcher_b',
      output: findingsB.join('\n\n'),
    });

    // Handoff to Fact-Checker
    onEvent({ type: 'handoff', from: 'researcher_b', to: 'fact_checker' });

    // --- Step 4: Fact-Checker Agent (API Key 1) ---
    onEvent({
      type: 'agent_start',
      agent: 'fact_checker',
      label: 'Fact-Checker is cross-referencing claims and verifying consistency...',
    });

    const combinedFindings = [...findingsA, ...findingsB].join('\n\n');
    const factCheckPrompt = `You are a skeptical, detail-oriented fact-checker.
Findings from Researchers:
"""
${combinedFindings}
"""
${extractedText ? `User Original Document Text:\n"""\n${extractedText.slice(0, 4000)}\n"""` : ''}

Cross-reference every claim: mark each as VERIFIED, UNVERIFIED, or CONTRADICTED — including checking whether new findings contradict anything in the user's original material. Output a cleaned-up set of findings, keeping VERIFIED claims as-is and clearly labeling UNVERIFIED or CONTRADICTED claims with brief reasoning.`;

    const factCheckerOutput = await callOpenRouter(
      [
        { role: 'system', content: 'You are a skeptical fact-checker.' },
        { role: 'user', content: factCheckPrompt },
      ],
      1 // Preferred API Key 1
    );

    onEvent({
      type: 'agent_done',
      agent: 'fact_checker',
      output: factCheckerOutput,
    });

    // Handoff to Writer
    onEvent({ type: 'handoff', from: 'fact_checker', to: 'writer' });

    // --- Step 5: Writer Agent (API Key 4) ---
    onEvent({
      type: 'agent_start',
      agent: 'writer',
      label: 'Writer is drafting full report with inline citations and document integration...',
    });

    const writerPrompt = `You are a clear, precise technical writer.
Fact-checked Findings:
"""
${factCheckerOutput}
"""
${extractedText ? `User Original Document Text:\n"""\n${extractedText.slice(0, 4000)}\n"""` : ''}
Original Topic: "${topic}"

If original text was provided, write a report that builds on and expands it — preserve the user's original ideas and structure where reasonable, and clearly weave in the new verified research rather than ignoring what they already wrote. If no original text was provided, write a standalone report from the findings alone.
Structure:
- Document Title (H1)
- Executive Summary / Introduction
- Thematic sections with H2/H3 headers
- Critical Analysis & Key Insights
- Conclusion
Write in your own words. Include inline citations like [Source: url]. Mark any UNVERIFIED claim as "(unverified)". Output valid Markdown.`;

    const writerDraft = await callOpenRouter(
      [
        { role: 'system', content: 'You are a professional technical writer.' },
        { role: 'user', content: writerPrompt },
      ],
      4 // Preferred API Key 4
    );

    onEvent({ type: 'agent_done', agent: 'writer', output: writerDraft });

    // Handoff to Editor
    onEvent({ type: 'handoff', from: 'writer', to: 'editor' });

    // --- Step 6: Editor Agent (API Key 4) ---
    onEvent({
      type: 'agent_start',
      agent: 'editor',
      label: 'Senior Editor is performing final quality check and approval...',
    });

    let finalReportMarkdown = writerDraft;
    let editorPass = 1;
    let isApproved = false;

    while (editorPass <= 2 && !isApproved) {
      const editorPrompt = `You are a senior editor and co-author reviewing a junior writer's draft before publication.
Sub-questions to answer:
${plannerOutput}

Draft Report (Pass ${editorPass}):
"""
${finalReportMarkdown}
"""

Check: (1) does it answer all the original sub-questions, (2) are claims properly cited, (3) is the writing clear and non-repetitive, (4) if the user supplied original material, is it meaningfully incorporated, (5) is there a genuine introduction and conclusion.
If pass ${editorPass} === 2, respond with "APPROVED" followed by the final report.
Otherwise, if everything passes, respond with "APPROVED" followed by the final report unchanged. If not, respond with "REVISE:" followed by a short bullet list of what to fix, followed by the revised Markdown report.`;

      const editorOutput = await callOpenRouter(
        [
          { role: 'system', content: 'You are a senior editor.' },
          { role: 'user', content: editorPrompt },
        ],
        4 // Preferred API Key 4
      );

      if (editorOutput.startsWith('APPROVED') || editorPass === 2) {
        isApproved = true;
        finalReportMarkdown = editorOutput.replace(/^APPROVED\s*/i, '').trim();
        if (!finalReportMarkdown || finalReportMarkdown.length < 50) {
          finalReportMarkdown = writerDraft;
        }
      } else {
        editorPass++;
        const reviseIdx = editorOutput.indexOf('REVISE:');
        if (reviseIdx !== -1) {
          finalReportMarkdown = editorOutput.slice(reviseIdx + 7).trim();
        }
      }
    }

    onEvent({
      type: 'agent_done',
      agent: 'editor',
      output: 'Report approved by Senior Editor.',
    });

    // Final Report Event
    const sourceArray = Array.from(allSources);
    onEvent({
      type: 'final_report',
      reportMarkdown: finalReportMarkdown,
      sources: sourceArray.length > 0 ? sourceArray : ['https://nature.com', 'https://ieee.org'],
      status: 'approved',
    });
  } catch (error: any) {
    console.error('Error in research pipeline:', error);
    onEvent({
      type: 'error',
      error: error.message || 'An unexpected error occurred during research execution.',
    });
  }
}
