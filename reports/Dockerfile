# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed.
# Pin versions in apk add command for better reproducibility and security
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV production

# Security improvement by adding a system group and user
# Creating a specific user for running the application enhances security by limiting permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
