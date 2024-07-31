# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install serve globally to serve the built app
RUN npm install -g serve

# Set the environment variable to serve production build
ENV NODE_ENV=production

# Build the application using Webpack 
RUN npm run web-build

# Expose port 8080
EXPOSE 80

# Start the application
CMD ["serve", "-s", "build", "-l", "80"]