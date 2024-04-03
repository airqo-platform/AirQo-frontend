FROM node:18.19.1 AS builder

# Set the working directory inside the container
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Build application
RUN yarn build

# Create the production image
FROM nginx:1.21.3

# Copy the compiled files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]