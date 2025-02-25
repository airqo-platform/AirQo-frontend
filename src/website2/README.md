## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# Website

Welcome to the Website repository, part of the AirQo Frontend project. This website is built with [Next.js](https://nextjs.org) and was bootstrapped using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The live website can be found at [airqo.net](https://airqo.net).

> **Note:** This repository only contains the frontend portion of the project. The backend has been built with Django and is maintained in the [airqo-api](https://github.com/airqo-platform/airqo-api) repository. If you wish to use the database for the website, please contact the project admin to obtain the necessary database URL for the frontend configuration.

This guide provides clear, step-by-step instructions to help you set up your local development environment, run the website, and contribute effectively. Additionally, it explains how to handle environment variables and update CI/CD workflows.

---

## Table of Contents

- [Website](#website)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Navigate to the Website Folder](#2-navigate-to-the-website-folder)
    - [3. Install Dependencies](#3-install-dependencies)
    - [4. Run the Development Server](#4-run-the-development-server)
  - [Environment Variables \& Workflow Updates](#environment-variables--workflow-updates)
  - [Backend \& Database Integration](#backend--database-integration)
  - [Contributing](#contributing)
  - [Learn More](#learn-more)
  - [Deployment](#deployment)

---

## Getting Started

Follow these steps to set up your local development environment for the website. These instructions are applicable on Windows, Mac, and Linux.

### 1. Clone the Repository

Clone the AirQo Frontend repository using the following command:

```bash
git clone https://github.com/airqo-platform/AirQo-frontend.git
```

_Tip for Mac/Linux:_  
If you encounter any permission issues with Git, ensure that Git is correctly installed on your system. You can install Git via [Homebrew](https://brew.sh) on Mac (`brew install git`) or use your package manager on Linux (e.g., `sudo apt-get install git` on Debian/Ubuntu).

### 2. Navigate to the Website Folder

After cloning the repository, navigate to the folder that contains the website application:

```bash
cd AirQo-frontend/src/website2
```

_Note:_  
The folder structure is consistent across all operating systems. Use your terminal (Mac/Linux) or Command Prompt/PowerShell (Windows) to run this command.

### 3. Install Dependencies

This project requires **Node.js version 18 or above**. Ensure you have Node.js and npm installed on your system by running:

```bash
node -v
npm -v
```

If you need to install or update Node.js, download it from [nodejs.org](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm) (especially useful for Mac/Linux).

To install the required dependencies using **npm**, run:

```bash
npm install
```

_For Mac/Linux Users:_  
If you experience permission issues while installing packages globally, consider using a Node version manager like [nvm](https://github.com/nvm-sh/nvm).

### 4. Run the Development Server

Launch the development server with the following command:

```bash
npm run dev
```

Once the server starts, open [http://localhost:3000](http://localhost:3000) in your browser to view the website. The page will automatically reload as you make changes.

_Alternate Tips for Mac/Linux:_

- Use your terminal’s tab completion to quickly navigate directories.
- If you’re using a firewall or proxy, ensure your local ports are accessible.

---

## Environment Variables & Workflow Updates

When adding new environment variables to the project, ensure that the CI/CD workflows remain consistent across staging, production, and preview environments.

For example, if you add new variables, update your workflow YAML files as follows:

```bash
echo "  NEXT_PUBLIC_OPENCAGE_API_KEY: ${{ secrets.WEBSITE_NEXT_PUBLIC_OPENCAGE_API_KEY }}" >> .env.yaml
echo "  NEXT_PUBLIC_API_TOKEN: ${{ secrets.WEBSITE_PROD_NEXT_PUBLIC_API_TOKEN }}" >> .env.yaml
```

**Important Notes:**

- Verify that the secret names used in your workflows match those defined in your repository.
- If you add new environment variables, please contact the project admin to have them added to the GitHub secrets.
- Always update the workflow files whenever you introduce or modify environment variables.
- You can find the workflow files for the different environments in the `.github/workflows` folder.

---

## Backend & Database Integration

The backend for this project is built with Django and is maintained in the [airqo-api](https://github.com/airqo-platform/airqo-api) repository. If you wish to connect the website to a live database:

- **Database Access:**  
  You will need the database URL which is not publicly available.  
  **Action Required:** Contact the project admin to obtain the database URL for frontend integration.

- **Environment Variables:**  
  Once you receive the database URL, update your environment variables accordingly in the `.env.yaml` file and any other relevant configuration files.

---

## Contributing

We welcome contributions from the open source community. To help you get started, please follow these steps:

1. **Fork and Clone:**

   - Fork the repository on GitHub.
   - Clone your fork to your local machine:
     ```bash
     git clone https://github.com/your-username/AirQo-frontend.git
     ```

2. **Create a Branch:**

   - Create a feature or bug-fix branch:
     ```bash
     git checkout -b feature/your-feature-name
     ```

3. **Make Your Changes:**

   - Follow the coding standards and guidelines established in the project.
   - Update documentation as needed.
   - Test your changes locally to ensure everything works as expected.

4. **Commit and Push:**

   - Commit your changes with a clear commit message:
     ```bash
     git commit -m "Description of your changes"
     ```
   - Push your branch to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```

5. **Open a Pull Request:**
   - Navigate to the main repository on GitHub and open a Pull Request against the `main` branch.
   - Provide a detailed description of your changes and reference any related issues.

---

## Learn More

To expand your knowledge about Next.js and modern web development, consider exploring these resources:

- **[Next.js Documentation](https://nextjs.org/docs)** – Learn about Next.js features and APIs.
- **[Learn Next.js](https://nextjs.org/learn)** – An interactive tutorial for building Next.js applications.
- **[Next.js GitHub Repository](https://github.com/vercel/next.js)** – Explore and contribute to the core Next.js codebase.

---

## Deployment

The simplest way to deploy the website is via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For more detailed deployment instructions, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

---

Thank you for your interest in contributing to our website. Your support and contributions are vital to the ongoing success and improvement of the project!

---
