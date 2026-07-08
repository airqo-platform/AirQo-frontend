import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IGNORED_CODES = new Set([400, 401, 403, 404]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const webhookUrl = process.env.BEACON_WEB_SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[beacon-web/slack] BEACON_WEB_SLACK_WEBHOOK_URL not set");
    return NextResponse.json({ ok: true });
  }

  const body = await req.json();
  const { level = "error", message, context = {} } = body;
  if (context.statusCode && IGNORED_CODES.has(context.statusCode)) {
    return NextResponse.json({ ok: true });
  }

  const emoji = level === "error" ? "🚨" : level === "warn" ? "⚠️" : "ℹ️";
  const env = process.env.NODE_ENV ?? "unknown";
  const stack = context.stack ? String(context.stack).slice(0, 500) : null;
  const componentStack = context.componentStack
    ? String(context.componentStack)
        .split("\n")
        .slice(0, 8)
        .join("\n")
        .slice(0, 400)
    : null;

  const slackBody = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} [beacon-web] ${level.toUpperCase()} — ${env}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Message:* ${message}` },
      },
      ...(context.errorName
        ? [
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Error Type:*\n${context.errorName}` },
                { type: "mrkdwn", text: `*URL:*\n${context.url ?? "unknown"}` },
              ],
            },
          ]
        : []),
      ...(stack
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Stack:*\n\`\`\`${stack}\`\`\`` },
            },
          ]
        : []),
      ...(componentStack
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Component Stack:*\n\`\`\`${componentStack}\`\`\``,
              },
            },
          ]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${new Date().toISOString()} | beacon-web | #notifs-beacon-web`,
          },
        ],
      },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackBody),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[beacon-web/slack] Webhook timed out");
    } else {
      console.error("[beacon-web/slack] Failed to post to Slack", err);
    }
  } finally {
    clearTimeout(timeout);
  }

  return NextResponse.json({ ok: true });
}
