import 'package:app/constants/config.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [
  {
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#edf3ff"}
    ]
  },
  {
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#edf3ff"}
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
    "elementType": "labels.text.stroke",
    "stylers": [
      {"color": "#fafafa"}
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text",
    "stylers": [
      {"color": "#064ce5"},
      {"saturation": 5}
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {"color": "#064ce5"}
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.stroke",
    "stylers": [
      {"color": "#064ce5"},
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#578afa"},
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#578afa"}
    ]
  },
  {
    "featureType": "landscape.natural.landcover",
    "stylers": [
      {"color": "#fafafa"}
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {"color": "#c3fed3"},
      {"weight": 0.5}
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {"color": "#ebf1f8"}
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {"weight": 0.5}
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {"color": "#c5d7fb"},
      {"weight": 0.5}
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "road.local",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {"visibility": "off"}
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {"color": "#a9c2f9"},
      {"visibility": "simplified"}
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {"color": "#1d62f7"},
      {"visibility": "off"}
    ]
  }
];

ThemeData lightTheme() {
  final base = ThemeData.light();

  /// height := line height * fontSize
  /// letterSpacing := 16 * letter-spacing(em)
  /// Theme.of(context).textTheme.headline1

  return base.copyWith(
    primaryColor: Colors.white,
    // accentColor: Config.appColor,
    // backgroundColor: Colors.white,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    textTheme: const TextTheme(
      headline4: TextStyle(
          fontSize: 48.0,
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.normal,
          height: 56.0 / 48.0),
      headline6: TextStyle(
        fontSize: 32.0,
        fontWeight: FontWeight.bold,
        fontStyle: FontStyle.normal,
        height: 40.0 / 32.0,
        letterSpacing: 16 * -0.01,
      ),
      bodyText1: TextStyle(
        fontSize: 16.0,
        fontWeight: FontWeight.normal,
        fontStyle: FontStyle.normal,
        height: 16.0 / 24.0,
      ),
      bodyText2: TextStyle(
        fontSize: 14.0,
        fontWeight: FontWeight.normal,
        fontStyle: FontStyle.normal,
        height: 18.0 / 14.0,
      ),
      caption: TextStyle(
        fontSize: 12.0,
        fontWeight: FontWeight.normal,
        fontStyle: FontStyle.normal,
        height: 12.0 / 16.0,
      ),
    ).apply(
      fontFamily: 'Inter',
      bodyColor: Config.appColorBlack,
      displayColor: Config.appColorBlack,
    ),
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

class CustomTextStyle {
  static TextStyle? headline10(BuildContext context) {
    return Theme.of(context).textTheme.headline6?.copyWith(
        fontSize: 16.0,
        fontWeight: FontWeight.bold,
        fontStyle: FontStyle.normal,
        height: 20.0 / 16.0);
  }

  /// CustomTextStyle.headline10(context),

  static TextStyle? headline7(BuildContext context) {
    return Theme.of(context).textTheme.headline6?.copyWith(
          fontSize: 24.0,
          fontWeight: FontWeight.bold,
          fontStyle: FontStyle.normal,
          height: 32.0 / 24.0,
        );
  }
}
