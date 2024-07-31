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

# Build the application using Webpack 
RUN npm run web-build

# Install serve globally to serve the built app
RUN npm install -g serve

# Set the environment variable to serve production build
ENV NODE_ENV=production


EXPOSE 80

# Use serve to serve the static files
CMD ["serve", "-s", "build", "-l", "${PORT}"]
