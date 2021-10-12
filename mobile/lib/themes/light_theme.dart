import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [
  {
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#d7e4fe"},
      {"visibility": "on"}
    ]
  },
  {
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#ffffff"}
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {"color": "#1d62f7"}
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#5c8df8"},
      {"visibility": "on"}
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#ffffff"}
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#aac3f7"}
    ]
  }
];

ThemeData lightTheme() {
  final base = ThemeData.light();

  return base.copyWith(
    // primaryColor: Colors.white,
    primaryColor: Colors.white,
    // accentColor: ColorConstants.appColor,
    // backgroundColor: Colors.white,
    visualDensity: VisualDensity.adaptivePlatformDensity,
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
    appBarTheme: const AppBarTheme(elevation: 0.0),
  );
}
