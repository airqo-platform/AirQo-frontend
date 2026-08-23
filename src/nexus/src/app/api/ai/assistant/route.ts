import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/shared/lib/auth';
import { isAiEnabled } from '@/modules/ai/server/config';
import { buildSystemPrompt } from '@/modules/ai/server/prompts';
import { FEATURE_LABELS } from '@/modules/ai/constants';
import { getAiProvider } from '@/modules/ai/server/provider';
import { FEATURE_SUGGESTED_PROMPTS } from '@/modules/ai/server/prompts';
import { checkRateLimit } from '@/shared/lib/rateLimit';
import type { AiFeatureId, AiStreamEvent } from '@/modules/ai/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* -------------------------------------------------------------------------- */
/*  GET — feature metadata, used by the client to bootstrap the UI            */
/* -------------------------------------------------------------------------- */

export async function GET() {
  const features = Object.keys(FEATURE_LABELS) as AiFeatureId[];
  const featureMap: Record<
    AiFeatureId,
    { label: string; suggestedPrompts: string[] }
  > = {} as Record<AiFeatureId, { label: string; suggestedPrompts: string[] }>;

  for (const fid of features) {
    featureMap[fid] = {
      label: FEATURE_LABELS[fid],
      suggestedPrompts: FEATURE_SUGGESTED_PROMPTS[fid] ?? [],
    };
  }

  return NextResponse.json(
    {
      enabled: isAiEnabled(),
      features: featureMap,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

/* -------------------------------------------------------------------------- */
/*  POST — stream a chat completion                                           */
/* -------------------------------------------------------------------------- */

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1),
  feature: z
    .enum([
      'home',
      'map',
      'data-export',
      'analytics',
      'data-visualizer',
      'rankings',
      'profile',
      'general',
    ] as const)
    .optional(),
  context: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  /* ---------- Session guard ---------- */
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { _id?: string } | undefined)?._id;

  if (!session?.user || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  /* ---------- Rate limit: 20 requests / minute per user ---------- */
  const rateLimitResult = checkRateLimit(`ai-chat:${userId}`, {
    windowMs: 60_000,
    maxRequests: 20,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            rateLimitResult.retryAfterMs / 1000
          ).toString(),
        },
      }
    );
  }

  /* ---------- Validate body ---------- */
  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await request.json();
    parsed = bodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  /* ---------- Disabled gate ---------- */
  if (!isAiEnabled()) {
    return NextResponse.json({
      disabled: true,
      message: 'AI assistant is not configured',
    });
  }

  /* ---------- Build prompt & stream ---------- */
  const feature: AiFeatureId = parsed.feature ?? 'general';
  const systemPrompt = buildSystemPrompt(feature, parsed.context);

  let provider;
  try {
    provider = getAiProvider();
  } catch (err) {
    return NextResponse.json(
      {
        disabled: true,
        message:
          err instanceof Error
            ? err.message
            : 'AI assistant is not available',
      },
      { status: 200 }
    );
  }

  // AbortController that the client can cancel via the request signal
  const abortController = new AbortController();
  request.signal.addEventListener('abort', () => abortController.abort());

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AiStreamEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller already closed
        }
      };

      try {
        for await (const chunk of provider.streamChat({
          messages: parsed.messages,
          system: systemPrompt,
          signal: abortController.signal,
        })) {
          send({ type: 'delta', content: chunk });
        }
        send({ type: 'done' });
      } catch (err) {
        if (
          abortController.signal.aborted ||
          (err instanceof DOMException && err.name === 'AbortError')
        ) {
          // Client disconnected — just close silently
        } else {
          send({
            type: 'error',
            message:
              err instanceof Error
                ? err.message
                : 'An unexpected error occurred',
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    },
  });
}
