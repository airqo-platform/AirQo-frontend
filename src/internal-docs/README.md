# Mariana Deep - Internal Documentation

This repository contains the containerized environment and Kubernetes Helm charts for **Mariana Deep**, AirQo's internal documentation platform powered by [BookStack](https://www.bookstackapp.com/).

## Table of Contents
- [Local Setup & Testing](#local-setup--testing)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Creating & Editing Documentation](#creating--editing-documentation)
- [Information Architecture](#information-architecture-product-focused)
- [Contributing Guidelines](#contributing-guidelines)
- [Security & Data Persistence](#security--data-persistence)

## Local Setup & Testing

To spin up the documentation platform locally for testing or local development:

1. **Configure the Environment**
   Duplicate the provided example environment file:
   
   *macOS / Linux:*
   ```bash
   cp .env.example .env
   ```
   *Windows (Command Prompt / PowerShell):*
   ```cmd
   copy .env.example .env
   ```

2. **Start the Containers**
   Use Docker Compose to build and start the environment in the background:
   ```bash
   docker-compose up -d
   ```

3. **Access the Application**
   Wait approximately 20 seconds for database migrations to complete.
   Open your browser and navigate to `http://localhost:6875`.
   *(Default credentials on first run: `admin@admin.com` / `password`)*

## Kubernetes Deployment

The project uses Helm charts located in the `k8s/` directory to deploy to our production cluster.

### Environments
- **Production**: Accessible at `https://platform.airqo.net/mariana`

### Deployment Commands
To deploy or upgrade the cluster, run the following Helm commands from the root of this project:

**Production:**
```bash
helm upgrade --install airqo-internal-docs k8s/ -f k8s/values-prod.yaml -n production
```

## Creating & Editing Documentation

BookStack features an intuitive WYSIWYG editor, making it incredibly easy for any technical contributor to document features, APIs, and runbooks without fighting markdown syntax (though Markdown is fully supported!).

### How to Create Content
1. **Navigate to the appropriate Book**: Look at the Information Architecture below to find exactly where your document belongs.
2. **Add a Chapter or Page**: Click the "New Page" or "New Chapter" button in the right sidebar menu.
3. **Use the Editor**: Write your documentation. You can drag-and-drop images directly into the editor. If you prefer raw markdown, you can switch the editor type in your user settings.
4. **Link Internal Content**: Use the "Link" button to easily search and interlink to other existing internal documents.

### Best Practices for Documentation
- **Keep it Concise**: Use bullet points, clear headings, and avoid massive walls of text. Scannability is key.
- **Keep it Updated**: The Boy Scout Rule applies—if you change a system's behavior, update its documentation in the exact same sprint.
- **Use Code Blocks**: When documenting CLI commands, scripts, or JSON payloads, use properly formatted code blocks.
- **Tagging**: Use tags on your pages (e.g., `api`, `deprecated`, `v2`) to make them highly searchable across the platform.

## Information Architecture (Product-Focused)

We organize all of our documentation using a **Product-focused approach**. Whether it's a mobile app, a microservice, or a data pipeline, every major initiative is treated as a Product. Strictly adhere to the following hierarchy:

1. **Shelves (High-Level Domains)**: Groups related products under a larger domain or suite.
   *(Examples: AirQo Platform, Data Pipelines, Mobile Apps, Infrastructure)*
2. **Books (The Products)**: Represents a specific Product, Microservice, or distinct Tool.
   *(Examples: Netmanager, Beacon, AirQo API, Ingestion Pipeline)*
3. **Chapters (Major Components)**: Groups related documentation topics within a specific Product.
   *(Examples: Architecture, API Reference, Deployment Guides, Runbooks)*
4. **Pages (Specific Documents)**: The granular, individual pieces of documentation.
   *(Examples: Authentication Flow Diagram, GET /v1/devices, How to run the calibration script)*

**Example Flow:**
`Shelves (AirQo Platform) -> Book (Netmanager) -> Chapter (API Reference) -> Page (Authentication Endpoint)`

## Contributing Guidelines

We encourage all engineers to actively contribute to Mariana Deep. If you see something wrong, fix it!

- **Typos and Minor Fixes**: Fix them immediately using the BookStack web interface. No review needed.
- **Major Architectural Documentation**: Draft the documentation in a Page and request a review (via Slack or email link) from the Lead Engineer of that specific product before finalizing.
- **Infrastructure Changes**: If you are modifying the Helm charts or Docker Compose configurations in this repository, please create a feature branch, test locally using Docker Compose, and open a standard Pull Request on GitHub.

## Security & Data Persistence

- **Public Access**: Explicitly disabled (`APP_PUBLIC=false`). Unauthenticated users cannot view any pages and will be immediately redirected to the login screen.
- **User Management**: Open registration is disabled. Administrators manually provision access.
- **Data Persistence**: In Kubernetes, Persistent Volume Claims (PVCs) ensure uploaded images and database state survive pod restarts. Locally, BookStack configuration and uploads are stored in the bind-mounted `./config` directory, while database data persists in the Docker-managed `bookstack_db_data` volume.
