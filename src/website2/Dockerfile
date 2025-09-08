# Optimized multi-stage build for minimal size
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Build stage
FROM base AS builder

# Build args for server-side environment variables (build time only)
# Keep only non-sensitive values here. Do NOT bake secrets into the image.
# Pass secrets at runtime (docker run -e ... or via your orchestrator) or
# use Docker BuildKit secrets if you need them during build.
ARG API_URL

# Build args for client-side environment variables (build time only)
# Public (NEXT_PUBLIC_) variables may be embedded in the client bundle.
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

# Set environment variables for build (server-side variables)
# Only set non-sensitive values. Do not store secrets in ENV here.
# Provide secrets at runtime instead.
ENV API_URL=$API_URL \
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
# Runtime secrets must be supplied by the platform (docker run -e ...) or
# via your orchestrator/secret manager. Do NOT bake them into the image.
ARG API_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

# Set environment variables for runtime (server-side variables)
# Only set non-sensitive defaults here. Supply sensitive values at runtime.
ENV API_URL=$API_URL \
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