import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
];

ThemeData lightTheme() {
  final base = ThemeData.light();

  return base.copyWith(
    primaryColor: Colors.white,
    accentColor: ColorConstants.appColor,
    backgroundColor: Colors.white,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    scaffoldBackgroundColor: Colors.white,
    appBarTheme: base.appBarTheme
        .copyWith(backgroundColor: Colors.white, elevation: 0.0),
    textTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'OpenSans',
          bodyColor: ColorConstants.appColor,
          displayColor: ColorConstants.appColor,
        ),
    // canvasColor: Colors.transparent,
    primaryTextTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'OpenSans',
          bodyColor: ColorConstants.appColor,
          displayColor: ColorConstants.appColor,
        ),
    accentTextTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'OpenSans',
          bodyColor: ColorConstants.appColor,
          displayColor: ColorConstants.appColor,
        ),
    iconTheme: IconThemeData(
      color: ColorConstants.appColor,
    ),
  );
}
