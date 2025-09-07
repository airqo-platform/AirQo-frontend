# Optimized multi-stage build for minimal size
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build stage
FROM base AS builder

# Build args for server-side environment variables (build time only)
ARG API_URL
ARG OPENCAGE_API_KEY
ARG API_TOKEN
ARG SLACK_WEBHOOK_URL
ARG SLACK_CHANNEL

# Build args for client-side environment variables (build time only)
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

# Set environment variables for build (server-side variables)
ENV API_URL=$API_URL \
    OPENCAGE_API_KEY=$OPENCAGE_API_KEY \
    API_TOKEN=$API_TOKEN \
    SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
    SLACK_CHANNEL=$SLACK_CHANNEL \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

# Install dependencies and build
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Ultra-minimal runtime - ONLY standalone output
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Runtime args for server-side environment variables
ARG API_URL
ARG OPENCAGE_API_KEY
ARG API_TOKEN
ARG SLACK_WEBHOOK_URL
ARG SLACK_CHANNEL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

# Set environment variables for runtime (server-side variables)
ENV API_URL=$API_URL \
    OPENCAGE_API_KEY=$OPENCAGE_API_KEY \
    API_TOKEN=$API_TOKEN \
    SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
    SLACK_CHANNEL=$SLACK_CHANNEL \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

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