# AirQo Website
---

- [Prerequisites](#prerequisites)
  - [Docker](#docker)
  - [OSX, Linux, Windows](#osx-linux-windows)
- [Setting up the development environment](#setting-up-the-development-environment)
  - [Clone the repository](#clone-the-repository)
  - [OSX](#osx)
  - [Linux](#linux)
  - [Windows](#windows)
- [Running the stack](#running-the-stack)
  - [Create the .envrc and .env files](#create-the-envrc-and-env-files)
  - [Docker](#docker-1)
  - [OSX, Linux, and Windows](#osx-linux-and-windows)
- [Development Invoke Commands](#development-invoke-commands)
  - [Running servers](#running-servers)
  - [Lint checks and auto fixing](#lint-checks-and-auto-fixing)
  - [Static builds](#static-builds)

## Prerequisites
#### Docker
-   `Git` [Installing Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
-   `Docker` [Install Docker Engine](https://docs.docker.com/engine/install/)
-   `Docker Compose` [Install Docker Compose](https://docs.docker.com/compose/install/)

#### OSX, Linux, Windows
-   `Git` [Installing Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
-   `Python 3.6 or higher (Python 3.7 preferred)` [Python Software Foundation](https://www.python.org/)
-   `NodeJs` [Download nodejs](https://nodejs.org/en/download/)
-   `Npm` [NpmJs](https://www.npmjs.com/get-npm)

## Setting up the development environment
### Clone the repository
Clone the AirQo repo

    git clone https://github.com/airqo-platform/AirQo-frontend.git

Change directory into the `website` folder of the cloned  `AirQo-frontend` folder

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
**_NOTE_**:

Currently the environment does not run well on Windows Bash / WSL ( Windows Subsystem for Linux ).
There are too many issues with line terminators and other environment inconsistencies.

The best option is to run "bare metal" Linux or dual boot. You can run Linux in a VM, but performance will suffer, buyer beware.

#### Direnv

Install direnv on your local machine, and set it up so it works
in your shell. These are the instructions for the (default) bash shell. If
you're using a different shell, you probably know where to configure it for
yours or the check the [direnv setup page](https://direnv.net/docs/hook.html) for your shell:

    sudo apt install direnv   # for Linux

Then, add the following line to the end of your shell configuration file as follows:

For BASH, add below to `.bashrc`

    eval "$(direnv hook bash)"

For ZSH, add below to `.zshrc`

    eval "$(direnv hook zsh)"
    
#### PostgreSQL

To use the apt repository, follow these steps:  

    # Create the file repository configuration:
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

    # Import the repository signing key:
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

    # Update the package lists:
    sudo apt-get update

    # Install the latest version of PostgreSQL.
    # If you want a specific version, use 'postgresql-12' or similar instead of 'postgresql':
    sudo apt-get -y install postgresql

#### Set up PostgreSQL

After installed, run PostgreSQL to generate the initial data using

    sudo service postgresql start
or

    sudo systemctl start postgresql
    
Now we need to create a new user in postgresql.

    sudo su postgres
    
- open a postgresql shell using `psql`.
- type `CREATE USER <YOURUSERNAME> CREATEDB;` where `<YOURUSERNAME>` matches your login / `whoami`
- type `CREATE USER gitprime_app_user CREATEDB;`
- type `ALTER USER <YOURUSERNAME> WITH SUPERUSER;` to give your user the super role.
- then press enter and exit the shell with `\q`

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
#### Create the `.envrc` and `.env` files

In the `.envrc` file add the following code

    layout python python3.7
    PATH_add node_modules/.bin
    dotenv

In summary, this ensures a python virtual environment is created each time you cd into this directory.
The `PATH` variable is updated with the `node_modules` path and `.env` loaded.

Populate the `.env` file with the following keys and their respective values

    DATABASE_URI
    SECRET_KEY
    CLOUDINARY_NAME
    CLOUDINARY_KEY
    CLOUDINARY_SECRET
    WEB_STATIC_HOST
    DJANGO_ALLOWED_HOSTS
    GS_BUCKET_NAME

**Note**: Leave the `DATABASE_URI` empty if you are following the development steps for docker.

#### Docker
Run the command below to build and run the containers for the database and website app

    docker-compose -f docker/docker-compose-dev.yml up --build

When the build is complete and both _airqo-website_ and _airqo-website-db_ containers, you can access the website app at http://localhost:8000/

#### OSX, Linux, and Windows

**For OSX and Linux**, you need to allow `direnv` to load the new changes, so run the command below

    direnv allow .

##### Install `Python` and `node` requirements

Python requirements

    pip install -r requirements.txt

Node requirements

    npm install

##### Run the website app

Once properly setup, run the following in two separate terminals:

    # Terminal 1
    inv run-web

    # Terminal 2
    inv webpack-server

At this point you should be able to navigate to the local instance at http://localhost:8000/

## Development Invoke Commands

#### Running servers

Running django server

    inv run-web

Running webpack dev-server

    inv webpack-server

#### Lint checks and auto fixing

Running `JS` lint checks

    inv lint-js

Auto fixing `JS` lint issues

    inv prettier-js

#### Static builds

Running `Webpack` build (production)

    inv run-build
