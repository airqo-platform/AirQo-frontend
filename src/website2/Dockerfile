# ------- Stage 1 : dependencies -------
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts --prefer-offline

# ------- Stage 2 : builder -------
FROM node:18-alpine AS builder
WORKDIR /app

# -----  ALL  NEXT_PUBLIC_  ARGS  (add below if you ever need more) -----
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OPENCAGE_API_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_API_TOKEN
ARG NEXT_PUBLIC_SLACK_WEBHOOK_URL
ARG NEXT_PUBLIC_SLACK_CHANNEL
ARG NEXT_PUBLIC_BUILD_YEAR
ENV NEXT_PUBLIC_BUILD_YEAR=$NEXT_PUBLIC_BUILD_YEAR

# Bring in prod deps + source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build standalone bundle (env-vars are inlined at this point)
RUN npm run build

# ------- Stage 3 : runner  (tiny) -------
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Non-root user (App Engine likes it)
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# Copy only the standalone artefact
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
ENV PORT=8080 HOSTNAME=0.0.0.0
EXPOSE 8080
CMD ["node", "server.js"]