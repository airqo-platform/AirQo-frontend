# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run web-build

# Install serve globally
RUN npm install -g serve

# Expose the port that serve will use
EXPOSE 80

# Use serve to serve the static files
CMD ["serve", "-s", "build", "-l", "80"]