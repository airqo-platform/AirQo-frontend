import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [];

ThemeData lightTheme() {
  final base = ThemeData.light();

  return base.copyWith(
    primaryColor: ColorConstants().appColor,
    // bottomAppBarColor: Colors.white,
    accentColor: ColorConstants().appColor,
    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}
