# syntax=docker/dockerfile:1
# Multi-stage build for smaller images and isolation :contentReference[oaicite:0]{index=0}

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
RUN npm run build

# 3. Prepare minimal production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080

# Create a non-root user for security
RUN addgroup -S app && adduser -S -G app app

# Copy node_modules, package.json, built output, and public assets
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next    # full build output :contentReference[oaicite:1]{index=1}
COPY --from=builder /app/public ./public

USER app
EXPOSE 8080

# Start in production mode using Next.js's built-in server :contentReference[oaicite:2]{index=2}
CMD ["npm", "run", "start"]
