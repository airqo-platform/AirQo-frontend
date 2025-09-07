# Optimized multi-stage build for minimal size
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build stage
FROM base AS builder

# Build args for client environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OPENCAGE_API_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_API_TOKEN
ARG NEXT_PUBLIC_SLACK_WEBHOOK_URL
ARG NEXT_PUBLIC_SLACK_CHANNEL

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_OPENCAGE_API_KEY=$NEXT_PUBLIC_OPENCAGE_API_KEY \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_API_TOKEN=$NEXT_PUBLIC_API_TOKEN \
    NEXT_PUBLIC_SLACK_WEBHOOK_URL=$NEXT_PUBLIC_SLACK_WEBHOOK_URL \
    NEXT_PUBLIC_SLACK_CHANNEL=$NEXT_PUBLIC_SLACK_CHANNEL

# Install dependencies and build
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Ultra-minimal runtime - ONLY standalone output
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy ONLY the standalone build (includes minimal runtime dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
ENV PORT=8080 HOSTNAME=0.0.0.0
EXPOSE 8080
CMD ["node", "server.js"]