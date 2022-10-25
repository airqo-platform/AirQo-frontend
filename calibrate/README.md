# Calibration App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Dependencies

- This project requires [Node version 14](https://nodejs.org/dist/) and
- [NPM](https://docs.npmjs.com/)

## Prerequisites
Use the [.env.sample](./.env.sample) to create a personal `.env` file. 

- `.env` file
```
PORT=5000
NODE_PATH=src/
REACT_APP_BASE_URL=http://staging-platform.airqo.net/api/v1/
REACT_APP_DOCS_BASE_URL=https://staging-docs.airqo.net/#/
REACT_APP_BASE_CALIBRATE_URL=
REACT_APP_AUTHORIZATION_TOKEN=ey123abc
```
Refer to the [documentation](https://staging-docs.airqo.net/#/../api/users?id=login) to learn how to obtain an authentication token.

## Installing product dependencies/packages
```
npm install
```

## Running project/app
```
npm run stage
```

## Available Scripts

### `npm run stage`

Starts the app in staging mode

### `npm run prod`

Starts the app in production mode

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
