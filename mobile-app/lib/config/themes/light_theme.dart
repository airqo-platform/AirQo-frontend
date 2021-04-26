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
    primaryColor: const Color(0xff5f1ee8),
    bottomAppBarColor: Colors.white,
  );
}
