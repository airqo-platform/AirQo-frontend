import 'package:app/constants/config.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [
  {
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#edf3ff'}
    ]
  },
  {
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#edf3ff'}
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
    'elementType': 'labels.text.stroke',
    'stylers': [
      {'color': '#fafafa'}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'labels.text',
    'stylers': [
      {'color': '#064ce5'},
      {'saturation': 5}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'labels.text.fill',
    'stylers': [
      {'color': '#064ce5'}
    ]
  },
  {
    'featureType': 'administrative.country',
    'elementType': 'labels.text.stroke',
    'stylers': [
      {'color': '#064ce5'},
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.locality',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.locality',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.neighborhood',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'administrative.neighborhood',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.neighborhood',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.province',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'administrative.province',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'landscape.man_made',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#578afa'},
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'landscape.man_made',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#578afa'}
    ]
  },
  {
    'featureType': 'landscape.natural.landcover',
    'stylers': [
      {'color': '#fafafa'}
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'labels.text',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'poi.business',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'geometry.fill',
    'stylers': [
      {'color': '#c3fed3'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'road',
    'stylers': [
      {'color': '#ebf1f8'}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry.fill',
    'stylers': [
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry.stroke',
    'stylers': [
      {'color': '#c5d7fb'},
      {'weight': 0.5}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'labels',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'labels.icon',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'road.arterial',
    'elementType': 'labels',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'labels',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'road.local',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'transit',
    'stylers': [
      {'visibility': 'off'}
    ]
  },
  {
    'featureType': 'water',
    'stylers': [
      {'color': '#a9c2f9'},
      {'visibility': 'simplified'}
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'labels.text',
    'stylers': [
      {'color': '#1d62f7'},
      {'visibility': 'off'}
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
