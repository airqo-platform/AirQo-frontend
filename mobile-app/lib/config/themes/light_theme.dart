import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

ThemeData lightTheme() {
  // TextTheme _lightTextTheme(TextTheme base) {
  //   return base.copyWith(
  //       headline1:
  //           base.headline1!.copyWith(fontSize: 22.0, color: Colors.deepPurple));
  // }

  final base = ThemeData.light();

  return base.copyWith(
    // textTheme: _lightTextTheme(base.textTheme),
    primaryColor: appColor,
    bottomAppBarColor: Colors.white,

    visualDensity: VisualDensity.adaptivePlatformDensity,
  );
}
