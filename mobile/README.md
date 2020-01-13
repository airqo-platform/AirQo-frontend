## AirQo-frontend/mobile
This directory contains the source code for the AirQo mobile apps. The mobile apps are hybrid apps developed uisng the [Ionic Framework](https://ionicframework.com/). 


## Set Up
Install Ionic and Cordova on your system:

    npm install -g ionic cordova

## Install NPM Dependencies
Once you clone this repository, run this command on your terminal to install all needed dependencies:

    npm install

## Install Cordova Plugin Dependencies
Run this command on your terminal to add a platform and install all needed puglins:

iOS:

    ionic cordova platform add ios
    ionic cordova build ios

Android:

    ionic cordova platform add android
    ionic cordova build android

## Launching the app
After installing the needed dependencies you are done, launch your app with any of these commands:

Browser:
  
    ionic serve
  
iOS Device:

    ionic cordova run ios --device

Android Device:

    ionic cordova run android --device


## Contributing
We invite you to help us build this platform. Please look up the [contributing guide](https://github.com/airqo-platform/AirQo-frontend/wiki) for details.

