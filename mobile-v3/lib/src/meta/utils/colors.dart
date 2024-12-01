import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  // static Color primaryColor = Color(0xff145FFF);
  // static Color backgroundColor = Color(0xff1C1D20);
  // static Color highlightColor = Color(0xff2E2F33);
  // static Color boldHeadlineColor = Color(0xff9EA3AA);
  // static Color secondaryHeadlineColor = Color(0xff60646C);

  static Color primaryColor = Color(0xff145FFF);
  static Color backgroundColor = Color(0xffF9FAFB);
  static Color highlightColor = Color(0xffF3F6F8);
  static Color boldHeadlineColor = Color(0xff6F87A1);
  static Color secondaryHeadlineColor = Color(0xff6F87A1);
}

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    splashColor: Colors.transparent,
    // highlightColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
        scrolledUnderElevation: 0,
        elevation: 0,
        backgroundColor: const Color(0xffF9FAFB)),
    brightness: Brightness.light,
    primaryColor: const Color(0xff145FFF),
    scaffoldBackgroundColor: const Color(0xffF9FAFB),
    highlightColor: const Color(0xffF3F6F8),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: const Color(0xff6F87A1),
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: const Color(0xff6F87A1),
      ),
      titleLarge: TextStyle(
          fontSize: 40, fontWeight: FontWeight.w700, color: Colors.black),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    splashColor: Colors.transparent,
    // highlightColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
        scrolledUnderElevation: 0,
        elevation: 0,
        backgroundColor: const Color(0xff1C1D20)),
    brightness: Brightness.dark,
    primaryColor: const Color(0xff145FFF),
    scaffoldBackgroundColor: const Color(0xff1C1D20),
    highlightColor: const Color(0xff2E2F33),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: const Color(0xff9EA3AA),
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: const Color(0xff60646C),
      ),
      titleLarge: TextStyle(
          fontSize: 40, fontWeight: FontWeight.w700, color: Colors.white),
    ),
  );
}
