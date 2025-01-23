# Use the official Node.js image as a base
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm ci

# Copy the rest of the application code
COPY . .

RUN npm run build

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

USER node

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]