# Node runtime as the base image
FROM node:18.19.1

# Setting the working directory in the container to /app
WORKDIR /app

# Coping package.json and yarn.lock into the root directory of the app
COPY package.json yarn.lock ./

# Installing project dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the project into the app directory
COPY . .

# Build the app
RUN yarn build

# Exposing the port 5173 for Vite
EXPOSE 5173

# Starting the app
CMD ["yarn", "dev"]
