# Use an official Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install dependencies with a frozen lockfile to ensure reproducibility
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build-time environment variables (ARG)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_OPENCAGE_API_KEY
ARG NEXT_PUBLIC_API_TOKEN

# Set runtime environment variables (ENV)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_OPENCAGE_API_KEY=$NEXT_PUBLIC_OPENCAGE_API_KEY \
    NEXT_PUBLIC_API_TOKEN=$NEXT_PUBLIC_API_TOKEN

# Build the Next.js application for production
RUN npm run build

# Expose the port that the app will listen on (App Engine expects 8080)
EXPOSE 8080

# Start the application, binding to 0.0.0.0 and using the PORT environment variable
CMD ["npm", "run", "start"]
