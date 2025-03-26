import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  // static Color primaryColor = Color(0xff145FFF);
  // static Color backgroundColor = Color(0xff1C1D20);
  // static Color highlightColor = Color(0xff2E2F33);
  // static Color boldHeadlineColor = Color(0xff9EA3AA);
  // static Color secondaryHeadlineColor = Color(0xff60646C);
  //#FAFAFA #E1E7EC
  static Color primaryColor = Color(0xff145FFF);
  static Color backgroundColor2 = Color(0xffFAFAFA);
  static Color borderColor2 = Color(0xffE1E7EC);
  static Color backgroundColor = Color(0xffF9FAFB);
  static Color highlightColor = Color(0xffF3F6F8);
  static Color boldHeadlineColor = Color(0xff6F87A1);
  static Color boldHeadlineColor2 = Color(0xff9EA3AA);
  static Color boldHeadlineColor3 = Color(0xff7A7F87);
  static Color boldHeadlineColor4 = Color(0xff2E2F33);
  static Color highlightColor2 = Color(0xffE2E3E5);
  static Color secondaryHeadlineColor = Color(0xff6F87A1);
  static Color darkThemeBackground = Color(0xff1C1D20);
  static Color secondaryHeadlineColor2 = Color(0xff60646C);
  static Color secondaryHeadlineColor3 = Color(0xff7A7F87);
  static Color dividerColordark = Color(0xff3E4147);
  static Color dividerColorlight = Color(0xffE1E7EC);
  static Color boldHeadlineColor5 = Color(0xff3F4B5F);
  static Color pmcolorlight = Color(0xff9EB0C2);
  static Color secondaryHeadlineColor4 = Color(0xff6F87A1);
  static Color navigationlight = Color(0xff485972);


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
        color: const Color(0xff000000),
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: Colors.black,
      ),
      headlineSmall: TextStyle(
        color: const Color(0xff000000),
      ),
      titleMedium: TextStyle(color: const Color(0xff000000)),
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
      headlineSmall: TextStyle(
        color: const Color(0xff7A7F87),
      ),
      titleMedium: TextStyle(color: const Color(0xffE2E3E5)),
      titleLarge: TextStyle(
          fontSize: 40, fontWeight: FontWeight.w700, color: Colors.white),
    ),
  );
}
