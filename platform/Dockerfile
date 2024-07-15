# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./

# Install corepack and enable it
RUN npm install -g corepack
RUN corepack enable

# Set yarn version
RUN yarn set version 4.3.1

# Install only production dependencies
RUN yarn install

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Copy over dependencies
COPY --from=deps /app ./

# Copy over source files
COPY .env .env.production
COPY . .

# Build the application
RUN yarn install
RUN yarn build

# Deployment image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use the non-root user to run the application
USER nextjs

# Expose the necessary port
EXPOSE 3000

# Set the command to run the application
CMD ["node", "server.js"]
