# syntax=docker/dockerfile:1

# 1. Install dependencies only when package files change
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --progress=false

# 2. Build the Next.js app, reusing deps cache
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# For TypeScript/Next.js projects ensure next.config.js has: output: 'standalone'
RUN npm run build

# 3. Prepare minimal production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080

# Create a non-root user
RUN addgroup -S app && adduser -S -G app app

# Copy only the standalone output and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER app

EXPOSE 8080
CMD ["node", "server.js"]
