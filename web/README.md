# AirQo Website

<https://airqo.africa>

## Local Setup Using Docker

The AirQo website can be configured locally for development and testing purposes.

### **Requirements**

- [Composer](https://getcomposer.org/) - PHP dependencies manager
- [Docker](https://www.docker.com/)
- Download and extract [CodeIgniter](https://codeigniter.com/) System folder at the root of this directory. Link: <https://api.github.com/repos/bcit-ci/CodeIgniter/zipball/refs/tags/3.1.11>
- Open ports: 8000, 8001, 88036

### **Setup**

Checkout this branch locally and `cd` to `AirQo-frontend/web`.  Make sure you have the latest `.env`. Also, add the database dump (e.g. airqo_db.sql) in `db_data` folder.

### **Installing dependencies**

To install the required dependencies, simply run `composer install`. This will install all the packages specified in the `composer.json` file. To update `composer`, run `composer update`. If you wish to add new dependencies, run `composer require <package name>`

Then run the following steps:

#### **Step 1: Build docker images**

```docker-compose
docker-compose build
```

The command above will build three docker images i.e. `PHP apache server`, `MySQL DB server` and `Adminer` - a web frontend for managing MySQL DB.

#### **Step 2: Start the containers and create a network to connect them together**

```docker-compose
docker-compose up
```

Once all the containers are fully configured, go to your browser and point it at `http://localhost:8000`. Admin panel is at `http://localhost:8000/admin`.
if you wish to browse the DB, goto `http://localhost:8001`. The credentials are provided in the `.env` file.

#### **Step 3: Clean up**

You can hit `ctrl+c` or `cmd+c`, then, run `docker-compose down`.

## Deploying on Google App Engine

The current version of AirQo Website runs on Google App Engine

Using the `gcloud` commandline tools:

### Staging

```shell
gcloud app deploy app-stage.yaml --project=<project name>
```

### Production

```shell
gcloud app deploy app-prod.yaml --project=<project name>
```
