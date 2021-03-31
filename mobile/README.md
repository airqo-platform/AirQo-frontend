## Overview
This is the source code for the mobile application (Android and iOS). The mobile application is hybrid and was built using the [Ionic Framework](https://ionicframework.com/docs/v3/).

## Installation
You will need to have Ionic & Cordova installed : 

```
npm install -g cordova ionic
```
Once you have successfully installed both Ionic and Cordova, kindly confirm with the commands below : 
```
ionic -v
cordova -v
```

## Getting Started

To begin using this repository, choose one of the following options to get started:
* [Download the latest release here](https://github.com/airqo-platform/AirQo-frontend/archive/master.zip)
* Clone the repo: `git clone https://github.com/airqo-platform/AirQo-frontend-app.git`
* Fork the repo

## Project Structure

```
.
 ├── resources                    # Build files on the specific platforms (iOS, Android) and app icon + splashscreen
 ├── src                          # This is where the app lives - *the main folder*
 ├── .editorconfig                # A helper file to define and maintain coding styles across environments
 ├── .gitignore                   # Specifies intentionally untracked files to ignore when using Git
 ├── config.xml                   # Ionic config file
 ├── ionic.config.json            # Global configuration for your Ionic app
 ├── package.json                 # Dependencies and build scripts
 ├── readme.md                    # Project description
 ├── tsconfig.json                # TypeScript configurations
 └── tslint.json                  # TypeScript linting options
```

### src directory
```
.
   ├── ...
   ├── src                       
   │   ├── app                    # This folder contains global modules and styling
   │   ├── assets                 # This folder contains images and the *data.json*
   |   ├── pages                  # Contains all the individual pages (home, tabs, category, list, single-item)
   |   ├── providers              # Contains functions that are globally accessed across all `pages`
   |   ├── theme                  # The global SCSS variables to use throughout the app
   |   ├── index.html             # The root index app file - This launches the app
   |   ├── manifest.json          # Metadata for the app
   │   └── service-worker.js      # Cache configurations
   └── ...
```

## Start the project
The project is started with the regular ionic commands.

1. Run `npm install` to install all dependencies.
2. Run `ionic serve` to start the development environment.

To run the app on a device :

```
$ ionic cordova platform add android
$ ionic cordova run android
```

```
$ ionic cordova platform add ios
$ ionic cordova run ios
```

In order to build an iOS app, you need to be running the commands on MacOS.


## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/airqo-platform/AirQo-frontend/issues) here on Github.

## References:
[Ionic Website](https://ionicframework.com/docs/v3/)

For more information about this project check the [AirQo Website](https://airqo.net/)


<!---
This `README.md` (this file) is specifically designed for the source code of the mobile application
--->
