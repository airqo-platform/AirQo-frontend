# The Mariana - Internal Documentation

This directory contains the containerized local development environment for "The Mariana," our internal documentation platform powered by [BookStack](https://www.bookstackapp.com/).

## Local Setup Instructions

To spin up the documentation platform locally, follow these steps:

1. **Configure the Environment**
   Duplicate the provided example environment file:
   
   **macOS / Linux (Bash):**
   ```bash
   cp .env.example .env
   ```
   **Windows (Command Prompt / PowerShell):**
   ```cmd
   copy .env.example .env
   ```
   *(You can leave the default values in `.env` for local testing. If you change passwords, ensure they match in both the BookStack and Database sections.)*

2. **Start the Containers**
   Use Docker Compose to build and start the environment in the background:
   ```bash
   docker-compose up -d
   ```

3. **Access the Application**
   Open your browser and navigate to `http://localhost:6875`.

4. **Default Administrator Credentials**
   On the very first run, BookStack creates a default admin account:
   - **Email:** `admin@admin.com`
   - **Password:** `password`
   
   > [!WARNING]
   > Immediately change these credentials upon your first login.

## Security & Access Control

As per our security standards, this documentation is strictly internal. 

- **Public Access is Disabled**: The `.env` file explicitly sets `APP_PUBLIC=false`. This ensures that unauthenticated users cannot view any pages, shelves, or books. They will be immediately redirected to the login screen.
- **Authentication**: We use BookStack's standard **Email & Password** authentication. 
- **User Management**: Open registration is disabled by default. Administrators must manually create accounts or invite new team members via the BookStack Settings > Users panel.

## Information Architecture (Product-Focused)

We organize all of our documentation using a **Product-focused approach**. Whether it's a mobile app, a microservice, or a data pipeline, every major initiative is treated as a Product.

When writing or organizing documentation, strictly adhere to the following mapping of BookStack's hierarchy:

### 1. Shelves (High-Level Domains)
Use Shelves to group related products under a larger domain or suite.
*Examples: AirQo Platform, Data Pipelines, Mobile Apps, Infrastructure.*

### 2. Books (The Products)
Use Books to represent a specific Product, Microservice, or distinct Tool.
*Examples: Netmanager, Beacon, AirQo API, Ingestion Pipeline.*

### 3. Chapters (Major Components)
Use Chapters to group related documentation topics within a specific Product.
*Examples: Architecture, API Reference, Deployment Guides, Runbooks, Onboarding.*

### 4. Pages (Specific Documents)
Use Pages for the granular, individual pieces of documentation.
*Examples: Authentication Flow Diagram, GET /v1/devices, How to run the calibration script.*

**Example Flow:**
If a new developer joins the Netmanager team, they navigate to:
`Shelves (AirQo Platform) -> Book (Netmanager) -> Chapter (API Reference) -> Page (Authentication Endpoint)`

## Stopping and Data Persistence

To stop the containers:
```bash
docker-compose down
```

All data (uploaded images, files, themes) is persisted in the `./config` folder, and the MariaDB database is persisted in the `./db_data` folder. These folders are ignored by git to prevent sensitive data leakage.
