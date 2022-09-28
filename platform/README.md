# Platform beta

[![AirQo next platform](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/ap5jjk/staging&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/ap5jjk/runs) [![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/branch/staging/graph/badge.svg)](https://codecov.io/gh/airqo-platform/AirQo-frontend)

## Table of generated contents

1. [Prerequisites](#prerequisites)
2. [Getting started](#getting-started)
3. [Running the application](#running-the-application)
   - [Cypress tests](#cypress-tests)
   - [The linter](#the-linter)
   - [The server](#the-server)
4. [Folder Structure](#folder-structure)

## Prerequisites

- [Git](https://gist.github.com/derhuerst/1b15ff4652a867391f03)
- [NodeJs](https://nodejs.org/en/) v16 or later
- [Yarn](https://classic.yarnpkg.com/lang/en/)

## Getting started

a) To get started, start by cloning the repository

    git clone https://github.com/airqo-platform/AirQo-frontend.git

b) Once the repo is cloned, `cd` into the platform folder within the `AirQo-frontend` directory

    cd platform

c) Create the `.env` file and fill it with the needed information. You can find the needed information in the `.env.example` file.

d) Install the dependencies

    yarn install

## Running the application

Run the following commands to start corresponding services

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

## Folder Structure

### src folder

The src folder is meant to separate application level code from the top-level configuration. The src folder is split into four main folders ie **core**, **lib**, **common** and **pages**.

    ├── common
    │   ├── components
    │   │   ├── Footer
    │   │   │   └── index.js
    │   │   │   └── Footer.module.scss
    │   │   ├── SideBar
    │   │   │   └── index.js
    │   │   │   └── SideBar.module.scss
    │   │   │   └── components
    │   │   │   │   └── Profile
    │   │   │   │   │   └── index.js
    │   │   │   │   │   └── Profile.module.scss
    │   ├── styles
    │   │   ├── global.scss
    ├── pages
    │   ├── app.js
    │   ├── Dashboard.js
    ├── lib
    ├── core

**Core**: This is where we place everything unrelated to the domain like API functions, DB functions including firebase/firestore connections, Authentication utilities, provider to send emails.

The nature of this folder is that you cannot import stuff from the lib, pages and components folders.

**Lib**: This is where we place utilities that will be mostly used by our components and partly in the pages. Utilities like;

- Custom hooks
- Prop functions eg getInitialProps, getServerSideProps
- Redux

This folder is also not supposed to import stuff from the pages and components folders.

**Common**: This is where we place the reusable UI components and the global css styles ie components and styles.
Under components, we can for example a SideBar component. What if our SideBar component had components within it that aren’t used elsewhere in the application eg Profile? We create a components folder within the SideBar component folder and add those components with their styles. The styles folder is where we place the global css styles.

### public folder

The public folder is meant for adding application public assets like images, gifs, and video clips

### cypress folder

This is an auto-generated folder structure for writing in Cypress tests [according to this documentation](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests).

### Top-level configuration

Below are the configuration files at the project top level

- [next.config.js](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [cypress.config.js](https://docs.cypress.io/guides/references/configuration#Configuration-File)
- [.eslintrc.json](https://eslint.org/docs/latest/user-guide/configuring/configuration-files#configuration-file-formats)
- [prettier.config.js](https://prettier.io/docs/en/configuration.html)
- [.babelrc.js](https://babeljs.io/docs/en/config-files)
