import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [];

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
