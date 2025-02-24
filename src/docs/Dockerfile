FROM node:16-alpine
LABEL description="AirQo public docs"
WORKDIR /docs
RUN npm install -g docsify-cli@latest
COPY . .
EXPOSE 3000/tcp
ENTRYPOINT docsify serve .