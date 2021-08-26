import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

const googleMapsLightTheme = [];

ThemeData lightTheme() {
  final base = ThemeData.light();

  return base.copyWith(
      primaryColor: ColorConstants().appColor,
      accentColor: ColorConstants().appColor,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      textTheme: ThemeData.light().textTheme.apply(fontFamily:'OpenSans'),
      primaryTextTheme: ThemeData.light()
          .textTheme.apply(
        fontFamily:'OpenSans',
        bodyColor: ColorConstants().appColor,
        displayColor: Colors.white,
      ),
      accentTextTheme: ThemeData.light().textTheme.apply(fontFamily:'OpenSans')
  );
}
