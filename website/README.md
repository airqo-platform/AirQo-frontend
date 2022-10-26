# AirQo Website

---

-   [Prerequisites](#prerequisites)
    -   [OSX, Linux, Windows](#osx-linux-windows)
    -   [Docker](#docker)
    -   [Git](#git)
-   [Setting up the development environment](#setting-up-the-development-environment)
    -   [Clone the repository](#clone-the-repository)
    -   [OSX](#osx)
    -   [Linux](#linux)
    -   [Windows](#windows)
-   [Running the stack](#running-the-stack)
    -   [Create the .envrc and .env files](#create-the-envrc-and-env-files)
    -   [Docker](#docker-1)
    -   [Running the website application](#run-the-website-app)
-   [Database Management](#database-management)
-   [Development Invoke Commands](#development-invoke-commands)
    -   [Running servers](#running-servers)
    -   [Lint checks and auto fixing](#lint-checks-and-auto-fixing)
    -   [Static builds](#static-builds)

## Prerequisites

#### OSX, Linux, Windows

-   `Python 3.6 or higher (Python 3.7 preferred)` [Python Download](https://www.python.org/)
-   `NodeJs v12` [Node Download](https://nodejs.org/en/download/)
-   `Npm` [NpmJs](https://www.npmjs.com/get-npm)

#### Docker

-   `Docker` [Install Docker Engine](https://docs.docker.com/engine/install/)

#### Git

-   `Git` [Installing Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)

## Setting up the development environment

### Clone the repository

    git clone https://github.com/airqo-platform/AirQo-frontend.git

Change directory into the `website` folder of the cloned `AirQo-frontend` folder

### OSX

#### HomeBrew

Install homebrew

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

#### Direnv

Install direnv on your local machine, and set it up so it works
in your shell. These are the instructions for the (default) bash shell. If
you're using a different shell, you probably know where to configure it for
yours or the check the [direnv setup page](https://direnv.net/docs/hook.html) for your shell:

    brew install direnv   # for Macs

Then, add the following line to the end of your shell configuration file as follows:

For BASH, add below to `~/.bash_profile` or `~/.profile`

    eval "$(direnv hook bash)"

For ZSH, add below to `~/.zshrc`

    eval "$(direnv hook zsh)"

#### PostgreSQL

The easiest way to install postgres on MacOS is through the [native app](https://postgresapp.com/downloads.html).

Use version 13.x

Brew installation

    brew install postgresql@13.4

After installing, follow the post-install console output and put the correct path to postgresql@13.4 in your `bash_profile` or `.zshrc` file.

start the local service

    brew services start postgresql@13.4 # if installed using homebrew
    or
    pg_ctl -D /usr/local/var/postgres start # if not installed using homebrew

Now we need to create two new users in postgresql.

    psql postgres

_NOTE_: if using zsh, error `zsh: command not found: psql`, you need to include `export PATH="/usr/local/Cellar/postgresql@13.4/13.4.XX/bin:$PATH"` in your `~/.zshrc`, after replacing `XX` with the actual patch/directory you have.

-   type `CREATE USER YOURUSERNAME CREATEDB;` (use your `whoami` username).
-   then press enter and exit the psql shell with `\q`

Stop the postgresql service using

    brew services stop postgresql@13.4  # if installed using homebrew
    or
    pg_ctl -D /usr/local/var/postgres stop  # if not installed using homebrew

### Linux

#### Pip

Install pip on your local machine in order to setup a virtual environment. [Setup](https://pip.pypa.io/en/stable/installation/)
Then install pipenv to create the virtual environment shell.

    pip install --user pipenv

To create a virtual environment:

    pipenv install shell

To activate virtual environment:

    pipenv shell

To deactivate virtual environment:

    $ exit

#### PostgreSQL

To use the apt repository, follow these steps:

    # Create the file repository configuration:
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

    # Import the repository signing key:
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

    # Update the package lists:
    sudo apt-get update

#### Set up PostgreSQL

After installed, run PostgreSQL to generate the initial data using

    sudo service postgresql start

or

    sudo systemctl start postgresql

Now we need to create a new user in postgresql.

    sudo su postgres

-   open a postgresql shell using `psql`.
-   type `CREATE USER <YOURUSERNAME> CREATEDB;` where `<YOURUSERNAME>` matches your login / `whoami`
-   type `CREATE USER gitprime_app_user CREATEDB;`
-   type `ALTER USER <YOURUSERNAME> WITH SUPERUSER;` to give your user the super role.
-   then press enter and exit the shell with `\q`

Stop the postgresql service using

    sudo service postgresql stop

or

    sudo systemctl stop postgresql

### Windows

**NOTE**: Currently the environment does not run well on Windows Bash / WSL ( Windows Subsystem for Linux ).
There are too many issues with line terminators and other environment inconsistencies.

We will have to configure the environment manually, `direnv` cant help us here.

First install postgresql on windows [Postgresql Windows Installers](https://www.postgresql.org/download/windows/)

#### Create Python Virtual Environment

In your Windows command shell prompt type in

    pip install virtualenv

Create the virtual environment

    virtualenv env

Activate the environment

    \env\Scripts\activate.bat

**NOTE**: It is important at this point to add the path to the `node_modules` in the environment path variable. check [windows setting path](https://www.windows-commandline.com/set-path-command-line/)
for more details.

## Running the stack

### Create the `.envrc` and `.env` files

**Note:** You will only need a .env file if you intend on running this website application on Linux or with docker

In the `.envrc` file add the following code

    layout python python3.7
    PATH_add node_modules/.bin
    dotenv

In summary, this ensures a python virtual environment is created each time you cd into this directory.
The `PATH` variable is updated with the `node_modules` path and `.env` loaded.

Populate the `.env` file in the root of the folder with the values of the key given in `.env.sample` file as a template.

Here is the [documentation link](https://staging-docs.airqo.net/#/../api/users?id=login) on how to get an authentication token for the `REACT_APP_AUTHORIZATION_TOKEN` variable.

**Note**: Remove `DATABASE_URI` variable if you are using docker

### OSX, Linux, and Windows

**For OSX**, you need to allow `direnv` to load the new changes, so run the command below

    direnv allow .

**For Linux**, activate your virtual environment

    pipenv shell

#### Install `Python` and `node` requirements

Python requirements

    pip install -r requirements.txt

Node requirements

    npm install

### Run the website app

For Linux activate a virtual environment. Once properly setup, run the following in two separate terminals:

    # Terminal 1 (shell)
    python manage.py collectstatic
    python manage.py makemigrations
    inv run-web

    # Terminal 2
    inv run-build
    inv webpack-server

At this point you should be able to navigate to the local instance at http://localhost:8000/

## Database Management

Create a superuser to access the content management portal. In your virtual environment:

    python manage.py createsuperuser

Follow the prompts and take note of your inputs.

To make changes [run the website app](#run-the-website-app) and route to http://localhost:8000/admin/. <br>
Sign in and choose the table you'd like to make edits to. Your changes can be viewed on the frontend http://localhost:8000/

To view the API route to http://localhost:8000/api

## Development Invoke Commands

### Running servers

Running django server

    inv run-web

Running webpack dev-server

    inv webpack-server

### Lint checks and auto fixing

Running `JS` lint checks

    inv lint-js

Auto fixing `JS` lint issues

    inv prettier-js

#### Static builds

Running `Webpack` build (production)

    inv run-build

### Docker

Build the application docker image with the command below. Make sure that your `google_application_credentials.json` file is at the root of the website folder just as your .env file

    docker build . \
        --build-arg REACT_WEB_STATIC_HOST=<<enter REACT_WEB_STATIC_HOST value>> \
        --build-arg REACT_NETMANAGER_BASE_URL=<<enter REACT_NETMANAGER_BASE_URL value>> \
        --build-arg REACT_APP_BASE_AIRQLOUDS_URL=<<enter REACT_APP_BASE_AIRQLOUDS_URL value>> \
        --build-arg REACT_APP_BASE_NEWSLETTER_URL=<<enter REACT_APP_BASE_NEWSLETTER_URL value>> \
        --build-arg REACT_APP_WEBSITE_BASE_URL=<<enter REACT_APP_WEBSITE_BASE_URL value>> \
        --build-arg REACT_APP_AUTHORIZATION_TOKEN=<<enter REACT_APP_AUTHORIZATION_TOKEN value>> \
        --tag <<enter an image tag of choice>>

Run the website application container with the command bellow

    docker run -d \
        -p 8080:8080 \
        --env-file=.env \
        <<enter an image tag used in the step above>>

After a few minutes, you should be able to access the website via port 8080 http://localhost:8080/
