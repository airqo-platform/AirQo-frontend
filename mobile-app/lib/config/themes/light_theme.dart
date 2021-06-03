import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

ThemeData lightTheme() {

  final base = ThemeData.light();

  return base.copyWith(
    primaryColor: appColor,
    // bottomAppBarColor: Colors.white,
    accentColor: appColor,
    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}

const googleMapsLightTheme =
[

];
