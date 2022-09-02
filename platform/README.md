# Platform beta

[![AirQo next platform](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/ap5jjk/staging&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ap5jjk/runs) [![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/branch/staging/graph/badge.svg)](https://codecov.io/gh/airqo-platform/AirQo-frontend)

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Run:](#run)
  - [Cypress tests](#cypress-tests)
  - [The linter](#the-linter)
  - [The server](#the-server)

## Prerequisites

- [Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
- [NodeJs](https://nodejs.org/en/) v16 or later
- [Yarn](https://classic.yarnpkg.com/lang/en/)

## Setup

a) Clone the repository

    git clone https://github.com/airqo-platform/AirQo-frontend.git

b) Change to the platform folder in the cloned repository directory

    cd AirQo-frontend/platform

c) Create the `.env` file and fill it with the needed information. You can find the needed information in the `.env.example` file.

d) Install the dependencies

    yarn add

## Run:

Run the following npm scripts to start corresponding services

### Cypress tests

    yarn cypress:open

A new browser screen opens you from which you can manaully run the tests

### The linter

    yarn lint

To lint all the JavaScript source code, and

    yarn lint-staged

To lint only the staged files

### The server

    yarn dev

To start the development server. The application can be accessed from [http://localhost:3000](http://localhost:3000)

    yarn start

To start the production server.

    yarn build

To build the application for production environments
