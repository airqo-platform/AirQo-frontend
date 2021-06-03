import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

ThemeData darkTheme() {

  final base = ThemeData.dark();

  return base.copyWith(
    primaryColor: appColor,
    accentColor: appColor,

    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}

