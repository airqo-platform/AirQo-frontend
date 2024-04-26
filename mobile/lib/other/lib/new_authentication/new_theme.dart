import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CustomTheme {
  static ThemeData get lightTheme {
    return _buildTheme(
      brightness: Brightness.light,
      appBarTheme: const AppBarTheme(
        elevation: 0.0,
      ),
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        error: Color(0xFFB00020),
        onError: Colors.white,
        background: Color(0xFFF5F5F5),
        onBackground: Colors.black,
        surface: Colors.white,
        onSurface: Colors.black,
        primary: Color(0xFF4CAF50),
        onPrimary: Colors.white,
        secondary: Color(0xFFFF9800),
        onSecondary: Colors.black,
      ),
      textTheme: _buildTextTheme(brightness: Brightness.light),
      inputDecorationTheme:
          _buildInputDecorationTheme(brightness: Brightness.light),
      extensions: const [
        AppColors(
          appBodyColor: Color(0xffF2F1F6),
          appColorBlack: Color(0xff121723),
          appColorBlue: Color(0xff145eff),
          appColorDisabled: Color(0xff145eff),
          appLoadingColor: Color(0xffEBEAEF),
          appPicColor: Color(0xffFF79C1),
          greyColor: Color(0xffD1D3D9),
          snackBarBgColor: Color(0xff121723),
          toolTipGreyColor: Colors.white,
          inactiveColor: Color(0xff121723),
          pollutantToggleBgColor: Color(0xffF5F8FF),
          darkGreyColor: Color(0xffADAFB6),
        ),
        AqiColors(
          aqiGreen: Color(0xff3AFF38),
          aqiGreenTextColor: Color(0xff03B600),
          aqiYellow: Color(0xffFFFF35),
          aqiYellowTextColor: Color(0xffA8A800),
          aqiOrange: Color(0xffFE9E35),
          aqiOrangeTextColor: Color(0xffB86000),
          aqiRed: Color(0xffFF4034),
          aqiRedTextColor: Color(0xffB80B00),
          aqiPurple: Color(0xFFDD38FF),
          aqiPurpleTextColor: Color(0xff8E00AC),
          aqiMaroon: Color(0xffA51F3F),
          aqiMaroonTextColor: Color(0xffDBA5B2),
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return _buildTheme(
      brightness: Brightness.dark,
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xff1c1d20),
        elevation: 0.0,
      ),
      colorScheme: const ColorScheme(
        brightness: Brightness.dark,
        primary: Color(0xff1c1d20),
        error: Color(0xFFCF6679),
        onError: Colors.white,
        background: Color(0xFF121723),
        onBackground: Colors.white,
        surface: Color(0xFF1A1D26),
        onSurface: Colors.white,
        onPrimary: Color(0xff1c1d20),
        secondary: Color(0xFFFFCC80),
        onSecondary: Color(0xff1c1d20),
      ),
      textTheme: _buildTextTheme(brightness: Brightness.dark),
      inputDecorationTheme:
          _buildInputDecorationTheme(brightness: Brightness.dark),
      extensions: const [
        AppColors(
          appBodyColor: Color(0xffF2F1F6),
          appColorBlack: Color(0xff1c1d20),
          appColorBlue: Color(0xff145eff),
          appColorDisabled: Color(0xff145eff),
          appLoadingColor: Color(0xffEBEAEF),
          appPicColor: Color(0xffFF79C1),
          greyColor: Color(0xffD1D3D9),
          snackBarBgColor: Color(0xff121723),
          toolTipGreyColor: Colors.white,
          inactiveColor: Color(0xff121723),
          pollutantToggleBgColor: Color(0xffF5F8FF),
          darkGreyColor: Color(0xffADAFB6),
        ),
        AqiColors(
          aqiGreen: Color(0xff3AFF38),
          aqiGreenTextColor: Color(0xff03B600),
          aqiYellow: Color(0xffFFFF35),
          aqiYellowTextColor: Color(0xffA8A800),
          aqiOrange: Color(0xffFE9E35),
          aqiOrangeTextColor: Color(0xffB86000),
          aqiRed: Color(0xffFF4034),
          aqiRedTextColor: Color(0xffB80B00),
          aqiPurple: Color(0xFFDD38FF),
          aqiPurpleTextColor: Color(0xff8E00AC),
          aqiMaroon: Color(0xffA51F3F),
          aqiMaroonTextColor: Color(0xffDBA5B2),
        ),
      ],
    );
  }

  static ThemeData _buildTheme({
    required Brightness brightness,
    required AppBarTheme appBarTheme,
    required ColorScheme colorScheme,
    required TextTheme textTheme,
    required InputDecorationTheme inputDecorationTheme,
    required List<ThemeExtension<dynamic>> extensions,
  }) {
    return ThemeData(
      brightness: brightness,
      colorScheme: colorScheme,
      textTheme: textTheme,
      primaryColor: colorScheme.primary,
      primaryColorLight: colorScheme.primaryContainer,
      primaryColorDark: colorScheme.primaryContainer,
      canvasColor: brightness == Brightness.light
          ? Colors.white
          : const Color(0xff2E2F33),
      scaffoldBackgroundColor: brightness == Brightness.light
          ? Colors.white
          : const Color(0xff2E2F33),
      appBarTheme: appBarTheme,
      iconTheme: IconThemeData(
        color: brightness == Brightness.light
            ? colorScheme.primary
            : colorScheme.onPrimary,
      ),
      primaryTextTheme: brightness == Brightness.light
          ? ThemeData.light().textTheme.apply(
                fontFamily: GoogleFonts.inter().fontFamily,
                bodyColor: colorScheme.primary,
                displayColor: colorScheme.primary,
              )
          : ThemeData.dark().textTheme.apply(
                fontFamily: GoogleFonts.inter().fontFamily,
                bodyColor: colorScheme.onPrimary,
                displayColor: colorScheme.onPrimary,
              ),
      inputDecorationTheme: inputDecorationTheme,
      visualDensity: VisualDensity.adaptivePlatformDensity,
      extensions: extensions,
    );
  }

  static TextTheme _buildTextTheme({required Brightness brightness}) {
    const headlineTextStyle = TextStyle(
      fontWeight: FontWeight.w700,
      fontStyle: FontStyle.normal,
      letterSpacing: 16 * -0.01,
    );

    const bodyTextStyle = TextStyle(
      fontWeight: FontWeight.w400,
      fontStyle: FontStyle.normal,
    );

    const labelTextStyle = TextStyle(
      fontWeight: FontWeight.w500,
      fontStyle: FontStyle.normal,
      letterSpacing: 16 * -0.24,
    );

    final baseColor =
        brightness == Brightness.light ? const Color(0xff60646c) : Colors.white;

    return TextTheme(
      displayLarge: headlineTextStyle.copyWith(
        fontSize: 80.0,
        color: baseColor,
        height: 88.0 / 80.0,
      ),
      displayMedium: headlineTextStyle.copyWith(
        fontSize: 64.0,
        color: baseColor,
        height: 72.0 / 64.0,
      ),
      displaySmall: headlineTextStyle.copyWith(
        fontSize: 56.0,
        color: baseColor,
        height: 64.0 / 56.0,
      ),
      headlineMedium: headlineTextStyle.copyWith(
        fontSize: 48.0,
        color: baseColor,
        height: 56.0 / 48.0,
      ),
      headlineSmall: headlineTextStyle.copyWith(
        fontSize: 40.0,
        color: baseColor,
        height: 48.0 / 40.0,
      ),
      titleLarge: headlineTextStyle.copyWith(
        fontSize: 32.0,
        color: baseColor,
        height: 40.0 / 32.0,
      ),
      bodyLarge: bodyTextStyle.copyWith(
        fontSize: 16.0,
        color: baseColor,
        height: 24.0 / 16.0,
      ),
      bodyMedium: bodyTextStyle.copyWith(
        fontSize: 14.0,
        color: baseColor,
        height: 18.0 / 14.0,
      ),
      bodySmall: bodyTextStyle.copyWith(
        fontSize: 12.0,
        color: baseColor,
        height: 16.0 / 12.0,
      ),
      labelSmall: labelTextStyle.copyWith(
        fontSize: 8.0,
        color: baseColor,
        height: 12.0 / 8.0,
      ),
      titleMedium: bodyTextStyle.copyWith(
        fontSize: 16.0,
        color: baseColor,
        height: 24.0 / 16.0,
      ),
      titleSmall: bodyTextStyle.copyWith(
        fontSize: 14.0,
        color: baseColor,
        height: 18.0 / 14.0,
      ),
    ).apply(
      fontFamily: GoogleFonts.inter().fontFamily,
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme(
      {required Brightness brightness}) {
    final baseColor =
        brightness == Brightness.light ? const Color(0xff60646c) : Colors.white;

    return InputDecorationTheme(
      contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
      filled: true,
      hintStyle: TextStyle(
        color: baseColor.withOpacity(0.32),
      ),
      prefixStyle: TextStyle(
        color: baseColor.withOpacity(0.32),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(
          color: const Color(0xffD1D3D9).withOpacity(0.7),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(
          color: const Color(0xffD1D3D9).withOpacity(0.7),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      border: OutlineInputBorder(
        borderSide: BorderSide(
          color: const Color(0xffD1D3D9).withOpacity(0.7),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: const BorderSide(
          color: Color(0xffFF4034),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderSide: const BorderSide(
          color: Color(0xffFF4034),
          width: 1.0,
        ),
        borderRadius: BorderRadius.circular(8.0),
      ),
      errorStyle: const TextStyle(
        fontSize: 0,
      ),
    );
  }
}

@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.appBodyColor,
    required this.appColorBlack,
    required this.appColorBlue,
    required this.appColorDisabled,
    required this.appLoadingColor,
    required this.appPicColor,
    required this.greyColor,
    required this.snackBarBgColor,
    required this.toolTipGreyColor,
    required this.inactiveColor,
    required this.pollutantToggleBgColor,
    required this.darkGreyColor,
  });

  final Color appBodyColor;
  final Color appColorBlack;
  final Color appColorBlue;
  final Color appColorDisabled;
  final Color appLoadingColor;
  final Color appPicColor;
  final Color greyColor;
  final Color snackBarBgColor;
  final Color toolTipGreyColor;
  final Color inactiveColor;
  final Color pollutantToggleBgColor;
  final Color darkGreyColor;

  @override
  AppColors copyWith({
    Color? appBodyColor,
    Color? appColorBlack,
    Color? appColorBlue,
    Color? appColorDisabled,
    Color? appLoadingColor,
    Color? appPicColor,
    Color? greyColor,
    Color? snackBarBgColor,
    Color? toolTipGreyColor,
    Color? inactiveColor,
    Color? pollutantToggleBgColor,
    Color? darkGreyColor,
  }) {
    return AppColors(
      appBodyColor: appBodyColor ?? this.appBodyColor,
      appColorBlack: appColorBlack ?? this.appColorBlack,
      appColorBlue: appColorBlue ?? this.appColorBlue,
      appColorDisabled: appColorDisabled ?? this.appColorDisabled,
      appLoadingColor: appLoadingColor ?? this.appLoadingColor,
      appPicColor: appPicColor ?? this.appPicColor,
      greyColor: greyColor ?? this.greyColor,
      snackBarBgColor: snackBarBgColor ?? this.snackBarBgColor,
      toolTipGreyColor: toolTipGreyColor ?? this.toolTipGreyColor,
      inactiveColor: inactiveColor ?? this.inactiveColor,
      pollutantToggleBgColor:
          pollutantToggleBgColor ?? this.pollutantToggleBgColor,
      darkGreyColor: darkGreyColor ?? this.darkGreyColor,
    );
  }

  @override
  AppColors lerp(ThemeExtension<AppColors>? other, double t) {
    if (other is! AppColors) {
      return this;
    }
    return AppColors(
      appBodyColor: Color.lerp(appBodyColor, other.appBodyColor, t)!,
      appColorBlack: Color.lerp(appColorBlack, other.appColorBlack, t)!,
      appColorBlue: Color.lerp(appColorBlue, other.appColorBlue, t)!,
      appColorDisabled:
          Color.lerp(appColorDisabled, other.appColorDisabled, t)!,
      appLoadingColor: Color.lerp(appLoadingColor, other.appLoadingColor, t)!,
      appPicColor: Color.lerp(appPicColor, other.appPicColor, t)!,
      greyColor: Color.lerp(greyColor, other.greyColor, t)!,
      snackBarBgColor: Color.lerp(snackBarBgColor, other.snackBarBgColor, t)!,
      toolTipGreyColor:
          Color.lerp(toolTipGreyColor, other.toolTipGreyColor, t)!,
      inactiveColor: Color.lerp(inactiveColor, other.inactiveColor, t)!,
      pollutantToggleBgColor:
          Color.lerp(pollutantToggleBgColor, other.pollutantToggleBgColor, t)!,
      darkGreyColor: Color.lerp(darkGreyColor, other.darkGreyColor, t)!,
    );
  }
}

@immutable
class AqiColors extends ThemeExtension<AqiColors> {
  const AqiColors({
    required this.aqiGreen,
    required this.aqiGreenTextColor,
    required this.aqiYellow,
    required this.aqiYellowTextColor,
    required this.aqiOrange,
    required this.aqiOrangeTextColor,
    required this.aqiRed,
    required this.aqiRedTextColor,
    required this.aqiPurple,
    required this.aqiPurpleTextColor,
    required this.aqiMaroon,
    required this.aqiMaroonTextColor,
  });

  final Color aqiGreen;
  final Color aqiGreenTextColor;
  final Color aqiYellow;
  final Color aqiYellowTextColor;
  final Color aqiOrange;
  final Color aqiOrangeTextColor;
  final Color aqiRed;
  final Color aqiRedTextColor;
  final Color aqiPurple;
  final Color aqiPurpleTextColor;
  final Color aqiMaroon;
  final Color aqiMaroonTextColor;

  @override
  AqiColors copyWith({
    Color? aqiGreen,
    Color? aqiGreenTextColor,
    Color? aqiYellow,
    Color? aqiYellowTextColor,
    Color? aqiOrange,
    Color? aqiOrangeTextColor,
    Color? aqiRed,
    Color? aqiRedTextColor,
    Color? aqiPurple,
    Color? aqiPurpleTextColor,
    Color? aqiMaroon,
    Color? aqiMaroonTextColor,
  }) {
    return AqiColors(
      aqiGreen: aqiGreen ?? this.aqiGreen,
      aqiGreenTextColor: aqiGreenTextColor ?? this.aqiGreenTextColor,
      aqiYellow: aqiYellow ?? this.aqiYellow,
      aqiYellowTextColor: aqiYellowTextColor ?? this.aqiYellowTextColor,
      aqiOrange: aqiOrange ?? this.aqiOrange,
      aqiOrangeTextColor: aqiOrangeTextColor ?? this.aqiOrangeTextColor,
      aqiRed: aqiRed ?? this.aqiRed,
      aqiRedTextColor: aqiRedTextColor ?? this.aqiRedTextColor,
      aqiPurple: aqiPurple ?? this.aqiPurple,
      aqiPurpleTextColor: aqiPurpleTextColor ?? this.aqiPurpleTextColor,
      aqiMaroon: aqiMaroon ?? this.aqiMaroon,
      aqiMaroonTextColor: aqiMaroonTextColor ?? this.aqiMaroonTextColor,
    );
  }

  @override
  AqiColors lerp(ThemeExtension<AqiColors>? other, double t) {
    if (other is! AqiColors) {
      return this;
    }
    return AqiColors(
      aqiGreen: Color.lerp(aqiGreen, other.aqiGreen, t)!,
      aqiGreenTextColor:
          Color.lerp(aqiGreenTextColor, other.aqiGreenTextColor, t)!,
      aqiYellow: Color.lerp(aqiYellow, other.aqiYellow, t)!,
      aqiYellowTextColor:
          Color.lerp(aqiYellowTextColor, other.aqiYellowTextColor, t)!,
      aqiOrange: Color.lerp(aqiOrange, other.aqiOrange, t)!,
      aqiOrangeTextColor:
          Color.lerp(aqiOrangeTextColor, other.aqiOrangeTextColor, t)!,
      aqiRed: Color.lerp(aqiRed, other.aqiRed, t)!,
      aqiRedTextColor: Color.lerp(aqiRedTextColor, other.aqiRedTextColor, t)!,
      aqiPurple: Color.lerp(aqiPurple, other.aqiPurple, t)!,
      aqiPurpleTextColor:
          Color.lerp(aqiPurpleTextColor, other.aqiPurpleTextColor, t)!,
      aqiMaroon: Color.lerp(aqiMaroon, other.aqiMaroon, t)!,
      aqiMaroonTextColor:
          Color.lerp(aqiMaroonTextColor, other.aqiMaroonTextColor, t)!,
    );
  }
}
