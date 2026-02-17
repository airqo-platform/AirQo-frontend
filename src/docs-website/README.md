# AirQo Digital Products Documentation .

This repository hosts the centralized documentation hub for all AirQo digital products, including Analytics, Vertex, Beacon, AI Platform, and the API. It is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Project Structure

The documentation is organized by product. Each product should follow this structure:

### Product (`/docs/<product-name>/`)
- `intro.md`
- `/how-tos/`
- `/resources/`
  - `release-notes.md`
  - `deprecations.md`
  - `known-issues.md`
- `faq.md`
