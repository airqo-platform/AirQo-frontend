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

# Coping the compiled files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Coping the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]