import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/extractor';
import { runResearchPipeline, StreamEvent } from '@/lib/agents/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const topic = (formData.get('topic') as string) || '';
    const file = formData.get('file') as File | null;

    if (!topic && !file) {
      return NextResponse.json(
        { error: 'Either a topic prompt or an attached file must be provided.' },
        { status: 400 }
      );
    }

    let extractedText = '';
    if (file && file.size > 0) {
      extractedText = await extractTextFromFile(file);
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (eventData: StreamEvent) => {
          const payload = `data: ${JSON.stringify(eventData)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        try {
          await runResearchPipeline(topic, extractedText, sendEvent);
        } catch (err: any) {
          sendEvent({
            type: 'error',
            error: err.message || 'Pipeline execution failed.',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API /api/research error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
