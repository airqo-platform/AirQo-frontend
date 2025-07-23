FROM node:18-alpine3.18 AS base

# Install dependencies only when needed
FROM base AS deps
# Update package index and install dependencies with error handling
RUN apk update && apk add --no-cache libc6-compat curl || \
    (sleep 5 && apk update && apk add --no-cache libc6-compat curl)
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install curl for health checks with error handling
RUN apk update && apk add --no-cache curl || \
    (sleep 5 && apk update && apk add --no-cache curl)

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]