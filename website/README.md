# AirQo Website

## Table of Contents

- [AirQo Website](#airqo-website)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Development Setup](#development-setup)
    - [Clone the Repository](#clone-the-repository)
    - [Environment Setup](#environment-setup)
      - [OSX](#osx)
      - [Linux](#linux)
      - [Windows](#windows)
    - [Database Setup](#database-setup)
    - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
    - [Backend (Django)](#backend-django)
    - [Frontend (React)](#frontend-react)
  - [Database Management](#database-management)
  - [Development Commands](#development-commands)
  - [Docker Setup](#docker-setup)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

AirQo Website is a web application built with Django (backend) and React (frontend). This README provides instructions for setting up the development environment, running the application, and managing the project.

## Prerequisites

- Python 3.7 or higher
- Node.js v12 or higher
- npm
- Git
- PostgreSQL 13.x
- Docker (optional)

## Development Setup

### Clone the Repository

```bash
git clone https://github.com/airqo-platform/AirQo-frontend.git
cd AirQo-frontend/website
```

### Environment Setup

#### OSX

1. Install Homebrew:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install direnv:

   ```bash
   brew install direnv
   ```

3. Add direnv hook to your shell configuration file (`~/.zshrc` or `~/.bash_profile`):

   ```bash
   eval "$(direnv hook zsh)"  # or bash
   ```

4. Install PostgreSQL:

   ```bash
   brew install postgresql@13
   ```

5. Start PostgreSQL service:
   ```bash
   brew services start postgresql@13
   ```

#### Linux

1. Install required packages:

   ```bash
   sudo apt-get update
   sudo apt-get install python3-pip postgresql
   ```

2. Install pipenv:

   ```bash
   pip install --user pipenv
   ```

3. Start PostgreSQL service:
   ```bash
   sudo systemctl start postgresql
   ```

#### Windows

1. Install PostgreSQL from the [official website](https://www.postgresql.org/download/windows/).

2. Install virtualenv:

   ```bash
   pip install virtualenv
   ```

3. Create and activate a virtual environment:
   ```bash
   virtualenv env
   .\env\Scripts\activate
   ```

### Database Setup

1. Access PostgreSQL:

   ```bash
   sudo -u postgres psql
   ```

2. Create a new user and database:

   ```sql
   CREATE USER yourusername WITH PASSWORD 'yourpassword' CREATEDB;
   CREATE DATABASE airqo_db OWNER yourusername;
   ```

3. Exit PostgreSQL:
   ```sql
   \q
   ```

### Environment Variables

1. Create `.envrc` and `.env` files in the project root:

   ```bash
   cp .env.sample .env
   ```

2. Add the following to `.envrc`:

   ```
   layout python python3.7
   PATH_add node_modules/.bin
   dotenv
   ```

3. Populate the `.env` file with necessary environment variables (refer to `.env.sample`).

## Running the Application

### Backend (Django)

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:

   ```bash
   python manage.py migrate
   ```

3. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React)

1. Install Node.js dependencies:

   ```bash
   npm install
   ```

2. Start the React development server:
   ```bash
   npm run standalone
   ```

The application should now be accessible at `http://localhost:8000/` (Django) and `http://localhost:8081/` (React).

## Database Management

1. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

2. Access the admin panel at `http://localhost:8000/admin/`

## Development Commands

- Run Django server: `inv run-web`
- Run webpack dev-server: `inv webpack-server`
- Run JS lint checks: `inv lint-js`
- Auto-fix JS lint issues: `inv prettier-js`
- Run webpack build (production): `inv run-build`

## Docker Setup

1. Build the Docker image:

   ```bash
   docker build . \
       --build-arg REACT_WEB_STATIC_HOST=<value> \
       --build-arg REACT_NETMANAGER_BASE_URL=<value> \
       --build-arg REACT_APP_BASE_AIRQLOUDS_URL=<value> \
       --build-arg REACT_APP_BASE_NEWSLETTER_URL=<value> \
       --build-arg REACT_APP_WEBSITE_BASE_URL=<value> \
       --build-arg REACT_APP_AUTHORIZATION_TOKEN=<value> \
       --build-arg REACT_APP_GEO_LOCATION_URL=<value> \
       --tag airqo-website:latest
   ```

2. Run the Docker container:
   ```bash
   docker run -d -p 8080:8080 --env-file=.env airqo-website:latest
   ```

The application should be accessible at `http://localhost:8080/`

## Troubleshooting

- If you encounter any issues with `direnv`, make sure it's properly set up in your shell configuration.
- For Windows users, ensure that the `node_modules/.bin` directory is added to your system's PATH.

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
