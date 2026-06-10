FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Docusaurus app
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 docusaurus

# Copy necessary files from builder with correct ownership
COPY --from=builder --chown=docusaurus:nodejs /app/package.json ./package.json
COPY --from=builder --chown=docusaurus:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=docusaurus:nodejs /app/build ./build
COPY --from=builder --chown=docusaurus:nodejs /app/docusaurus.config.ts ./docusaurus.config.ts

# Switch to non-root user
USER docusaurus

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "serve", "--", "--host", "0.0.0.0", "--no-open"]
