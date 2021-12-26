import 'package:app/constants/config.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [
  {
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#d7e4fe'},
      {'visibility': 'on'}
    ]
  },
  {
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'},
      {'weight': 1.5}
    ]
  },
  {
    'elementType': 'labels.icon',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'elementType': 'labels.text.fill',
    'stylers': [
      {'color': '#1d62f7'}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#5c8df8'},
      {'weight': 1}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#5c8df8'},
      {'weight': 1}
    ]
  },
  {
    'featureType': 'administrative.locality',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#5c8df8'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'administrative.province',
    'elementType': 'geometry.fill',
    'stylers': [
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'administrative.province',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#5c8df8'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'landscape.man_made',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#5c8df8'},
      {'visibility': 'on'},
      {'weight': 1.5}
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#6afb91'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#ffffff'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#AAC3f7'}
    ]
  }
];

ThemeData lightTheme() {
  final base = ThemeData.light();

  return base.copyWith(
    primaryColor: Colors.white,
    // accentColor: Config.appColor,
    // backgroundColor: Colors.white,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    textTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'Inter',
          bodyColor: Config.appColor,
          displayColor: Config.appColor,
        ),
    // canvasColor: Colors.transparent,
    primaryTextTheme: ThemeData.light().textTheme.apply(
          fontFamily: 'Inter',
          bodyColor: Config.appColor,
          displayColor: Config.appColor,
        ),
    iconTheme: IconThemeData(
      color: Config.appColor,
    ),
    appBarTheme: const AppBarTheme(elevation: 0.0),
  );
}
