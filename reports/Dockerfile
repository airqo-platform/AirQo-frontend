# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm install

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
COPY .env .env.production
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Copy whole app from builder
COPY --from=builder /app .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add user nextjs to run the app (admin privileges)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["npx", "next", "start"]
