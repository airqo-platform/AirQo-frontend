# Use Node.js Alpine image for smaller size
FROM node:20-alpine AS base

# Install dependencies needed for node-gyp
RUN apk add --no-cache libc6-compat

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy all files
COPY . .

# Disable telemetry and set production environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Public env read at build time (see .env.example)
ARG NEXT_PUBLIC_ENV=production
ARG NEXT_PUBLIC_POSTHOG_KEY=
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# Start the application using the standalone server
CMD ["node", "server.js"]