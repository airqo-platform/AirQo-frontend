# AI Assistant Module

A clean foundation for integrating an external AI agent into the AirQo Nexus app.
The module streams responses, is feature-aware (knows which page the user is on),
and serves as a thin server-side proxy to an external AI agent API.

---

## Architecture

```
Client UI (FAB → Drawer)
       │
       │  POST /api/ai/assistant  (SSE stream)
       ▼
  API Route (route.ts)
       │
       ├─ Session guard (getServerSession)
       ├─ Rate limiter (20 req/min per user)
       ├─ Zod validation
       ├─ Disabled gate (returns { disabled: true, message })
       │
       ▼
  Provider abstraction (provider.ts)
       │
       ├─ createOpenAICompatibleProvider   ← POST /chat/completions, parse SSE
       ├─ createDevFallbackProvider        ← dev stub when no agent URL
       └─ getAiProvider()                  ← picks based on agentUrl presence
       │
       ▼
  External AI Agent API  (OpenAI-compatible /chat/completions)
```

### File map

```
src/modules/ai/
├── types.ts                       # Shared TypeScript types
├── constants.ts                   # FEATURE_LABELS map
├── server/
│   ├── config.ts                  # Server-only env config (never leaks to client)
│   ├── prompts.ts                 # System prompt builder + suggested prompts
│   └── provider.ts                # Provider interface + OpenAI-compatible + dev fallback
├── context/
│   ├── ai-feature-context.ts      # pathname → AiFeatureId mapping + getPageMetadata()
│   └── ai-page-context.tsx        # AiPageContextProvider for page-provided context overrides
├── hooks/
│   └── useAiAssistant.ts          # Client hook (SSE streaming, state, abort)
├── components/
│   ├── AiAssistant.tsx            # Composed root (Drawer + hook + page detection)
│   ├── AiAssistantFab.tsx         # Floating action button (40px, AqMagicWand01)
│   ├── AiDrawer.tsx               # Floating right-side drawer (chat + prompts)
│   └── AiDrawerTrigger.tsx        # Small icon button for page headers
├── __tests__/
│   ├── provider.test.ts
│   ├── prompts.test.ts
│   └── ai-feature-context.test.ts

src/app/api/ai/assistant/
└── route.ts                       # GET (config) + POST (streaming chat)
```

---

## Configuration

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_AI_ENABLED` | `false` | Single application-wide toggle. Must be `"true"` to show the FAB and enable the API. |
| `AI_AGENT_URL` | `""` | External AI agent endpoint (base URL). The provider appends `/chat/completions`. Server-side only. |
| `AI_AGENT_API_KEY` | `""` | Optional auth key for the agent. Sent as `Authorization: Bearer <key>`. Server-side only. |

### Quick start (no agent endpoint — dev fallback)

```bash
# .env.local
NEXT_PUBLIC_AI_ENABLED=true
AI_AGENT_URL=
```

This shows the FAB and opens the drawer. Without an agent URL, the dev fallback
yields a short message explaining that no agent is configured. The full streaming
UI flow is testable without any external service.

### Connecting an external agent

```bash
# .env.local
NEXT_PUBLIC_AI_ENABLED=true
AI_AGENT_URL=https://your-agent.example.com/v1
AI_AGENT_API_KEY=your-secret-key
```

Any provider that exposes the OpenAI-compatible `/v1/chat/completions` SSE
interface works (OpenAI, Azure OpenAI, together.ai, Groq, Ollama, etc.).

---

## External AI Agent API Contract (Recommendations)

The module expects the external agent to expose an **OpenAI-compatible
`/chat/completions` streaming endpoint**. This is the de facto standard for
chat completion APIs.

### Request

```
POST {AI_AGENT_URL}/chat/completions
Content-Type: application/json
Authorization: Bearer <AI_AGENT_API_KEY>

{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "<system prompt with feature context>" },
    { "role": "user", "content": "What is the AQI at Kampala?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": true
}
```

### SSE response format

```
data: {"choices":[{"delta":{"content":"Hello"}}]}

data: {"choices":[{"delta":{"content":"!"}}]}

data: [DONE]
```

Each `data:` line contains a JSON object with `choices[0].delta.content` as the
text chunk. The stream ends with `data: [DONE]`.

### Recommendations for the agent

- **Feature context**: The system prompt includes which feature page the user is
  on. The agent should use this to give feature-aware answers (e.g., "On the
  Analytics page, here's what those charts show…").
- **Cancellation**: The proxy passes the client's `AbortSignal` through to the
  agent's fetch call. The agent should handle connection abort gracefully.
- **Error responses**: Return non-2xx HTTP status codes with a JSON body
  `{"error": {"message": "..."}}` on failure. The proxy surfaces the error
  message to the client.
- **Rate limiting**: The agent should enforce its own rate limits. The Nexus
  proxy enforces 20 requests/minute per user as an additional layer.

---

## Adding a New Feature Integration

To show AI context-awareness for a new page:

### 1. Register the feature ID

In `src/modules/ai/types.ts`, add the new ID to `AiFeatureId`:

```ts
export type AiFeatureId = '...' | 'my-new-feature';
```

### 2. Add label, description, and suggested prompts

In `src/modules/ai/server/prompts.ts`:
- Add a description to `FEATURE_DESCRIPTIONS`
- Add a label to `FEATURE_LABELS` (in `constants.ts`)
- Add 3 suggested prompts to `FEATURE_SUGGESTED_PROMPTS`

### 3. Add the pathname mapping

In `src/modules/ai/context/ai-feature-context.ts`, add a mapping in
`getFeatureFromPathname()`.

### 4. Mount the components

**Floating assistant (FAB + Drawer):** Already auto-mounted in `MainLayout` and
`MapLayout`. It will detect the new feature automatically from the pathname.

**Inline trigger button (optional):** Add `AiDrawerTrigger` in the page header:

```tsx
'use client';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';

// In your page header:
<AiDrawerTrigger onClick={() => openAiDrawer()} label="AI Assistant" />
```

Then handle the drawer open state in the parent page component.

---

## Page Detection & Agent Crawling

### How the widget detects the current page

The AI widget automatically detects which page the user is on using a
three-layer system:

1. **`usePathname()` → `getPageMetadata(pathname)`**: On every render, the
   `AiAssistant` component reads the Next.js pathname and maps it to a
   `feature` ID, human-readable `pageTitle`, and `pageDescription` via
   `getPageMetadata()`.

2. **`useAiPageContext()`**: Individual pages can wrap their content with
   `<AiPageContextProvider>` to provide richer context overrides — a custom
   title, description, or structured `data` object (e.g., chart count,
   selected site IDs). When present, these override the auto-detected values.

3. **`AiAssistant` builds a rich context object** combining both sources:
   ```ts
   {
     pathname: '/air-quality/analytics',
     pageTitle: 'Air Quality Analysis',     // from page provider or auto-detect
     pageDescription: 'Compare and analyze air quality trends...',
     data: { chartCount: 5, chartTitles: [...] }  // from page provider only
   }
   ```

### What is sent to the agent API

The POST body to `/api/ai/assistant` includes:

```json
{
  "messages": [...],
  "feature": "analytics",
  "context": {
    "pathname": "/air-quality/analytics",
    "pageTitle": "Air Quality Analysis",
    "pageDescription": "Compare and analyze air quality trends across locations.",
    "data": { "chartCount": 5, "chartTitles": ["PM2.5 Trends", "..."] }
  }
}
```

The server-side `buildSystemPrompt(feature, context)` injects the page
metadata into the system prompt so the model knows exactly what page the
user is viewing.

### AI agent API contract for crawling

When the agent receives a request with page context, it SHOULD be able to
crawl/fetch the application page (with appropriate authentication) to see the
current page's rendered content, and combine that with the structured
`context.data` to answer accurately.

**Best practices:**

- **Treat `pathname` as the canonical page identifier.** The agent should
  fetch the page server-side (with a service token or session) to read the
  live content. This is especially useful for pages with dynamic data the
  structured context doesn't capture.

- **Prefer structured `context.data` when present.** It's cheaper and more
  reliable than crawling. Use crawling as a fallback or for supplementary
  detail.

- **Handle missing/partial context gracefully.** Fall back to the feature
  label + page title when `context.data` is absent or sparse. The feature
  alone gives the agent enough orientation to provide useful answers.

- **Never send sensitive data in `context.data`.** Keep it to display-level
  summaries (chart titles, selection counts, date ranges). No tokens, PII,
  or internal IDs that shouldn't be exposed.

- **Rate-limit and cache crawled pages.** Avoid hammering the app with
  requests for every chat message. Cache page content for a short TTL
  (e.g., 30–60 seconds) and respect the app's rate limits.

### Providing page context from a page

Any page component can inject structured context for the AI assistant:

```tsx
'use client';
import { AiPageContextProvider } from '@/modules/ai/context/ai-page-context';

export function MyPage() {
  const charts = useCharts(); // your data hook
  return (
    <AiPageContextProvider
      value={{
        pageTitle: 'My Custom Page',
        pageDescription: 'What this page does',
        data: { itemCount: charts.length },
      }}
    >
      {/* page content */}
    </AiPageContextProvider>
  );
}
```

---

## Security Notes

### API keys stay server-side

`AI_AGENT_URL` and `AI_AGENT_API_KEY` are read in `src/modules/ai/server/config.ts`
and only used inside the API route and server-side providers. They are never
included in any client bundle, Next.js response, or log output.

`NEXT_PUBLIC_AI_ENABLED` is the only client-visible env var — it's a boolean
toggle with no sensitive data.

### Rate limiting

The POST endpoint enforces **20 requests per minute per authenticated user**
using the existing in-memory `checkRateLimit` utility. The key is
`ai-chat:<userId>`. This is documented as a single-instance limiter — for
multi-instance deployments, swap in Redis/Upstash.

### Session guard

Every POST request requires an active NextAuth session. Unauthenticated
requests receive a `401`.

### Prompt injection caution

The system prompt is built server-side from feature metadata. User-provided
messages are passed directly to the model. For production hardening, consider:
- Input sanitization / length limits (the zod schema caps `content` at 4000
  chars).
- Filtering or escaping user messages that attempt to override the system
  prompt.
- Logging suspicious patterns for review.

The current foundation relies on the model's own instruction-following safety.

---

## Swapping in the Vercel AI SDK Later

The provider abstraction (`AiProvider` interface) is intentionally minimal:

```ts
interface AiProvider {
  streamChat(params: {
    messages: AiMessage[];
    system: string;
    signal?: AbortSignal;
  }): AsyncIterable<string>;
}
```

To adopt the [Vercel AI SDK](https://sdk.vercel.ai):

1. Install `ai` and the provider package (e.g. `@ai-sdk/openai`).
2. Create a new provider file that wraps `streamText()` / `streamChat()`.
3. Implement the same `AiProvider` interface (yield chunks from the SDK's
   `textStream`).
4. Update `getAiProvider()` to return the new implementation.

The API route, client hook, and UI components require **zero changes** — they
consume the same SSE wire format (`data: {"type":"delta","content":"..."}\n\n`).

---

## Testing

```bash
yarn test -- --testPathPattern=modules/ai
```

- `provider.test.ts` — OpenAI-compatible provider with mocked `fetch` (URL,
  auth, body, SSE parsing, `[DONE]`, error handling) and dev fallback provider
  (yields chunks, completes).
- `prompts.test.ts` — system prompt includes feature label; suggested prompts
  has 3 entries per feature.
- `ai-feature-context.test.ts` — pathname → feature ID mapping coverage.

All tests run against mocked `fetch` — no real network calls.
