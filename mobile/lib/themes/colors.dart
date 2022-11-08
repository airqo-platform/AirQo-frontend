import 'package:flutter/material.dart';

@immutable
class AppColors extends ThemeExtension<AppColors> {
  const AppColors({
    required this.appBodyColor,
    required this.appColorBlack,
    required this.appColorBlue,
    required this.appColorDisabled,
    required this.appLoadingColor,
    required this.appPicColor,
    required this.darkGreyColor,
    required this.greyColor,
    required this.snackBarBgColor,
    required this.toolTipGreyColor,
    required this.inactiveColor,
    required this.pollutantToggleBgColor,
  });

  final Color appBodyColor;
  final Color appColorBlack;
  final Color appColorBlue;
  final Color appColorDisabled;
  final Color appLoadingColor;
  final Color appPicColor;
  final Color darkGreyColor;
  final Color greyColor;
  final Color snackBarBgColor;
  final Color toolTipGreyColor;
  final Color inactiveColor;
  final Color pollutantToggleBgColor;

  @override
  AppColors copyWith({
    Color? appBodyColor,
    Color? appColorBlack,
    Color? appColorBlue,
    Color? appColorDisabled,
    Color? appLoadingColor,
    Color? appPicColor,
    Color? darkGreyColor,
    Color? greyColor,
    Color? snackBarBgColor,
    Color? toolTipGreyColor,
    Color? inactiveColor,
    Color? pollutantToggleBgColor,
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
      appBodyColor:
          Color.lerp(appBodyColor, other.appBodyColor, t) ?? appBodyColor,
      appColorBlack:
          Color.lerp(appColorBlack, other.appColorBlack, t) ?? appColorBlack,
      appColorBlue:
          Color.lerp(appColorBlue, other.appColorBlue, t) ?? appColorBlue,
      appColorDisabled:
          Color.lerp(appColorDisabled, other.appColorDisabled, t) ??
              appColorDisabled,
      appLoadingColor: Color.lerp(appLoadingColor, other.appLoadingColor, t) ??
          appLoadingColor,
      appPicColor: Color.lerp(appPicColor, other.appPicColor, t) ?? appPicColor,
      greyColor: Color.lerp(greyColor, other.greyColor, t) ?? greyColor,
      snackBarBgColor: Color.lerp(snackBarBgColor, other.snackBarBgColor, t) ??
          snackBarBgColor,
      toolTipGreyColor:
          Color.lerp(toolTipGreyColor, other.toolTipGreyColor, t) ??
              toolTipGreyColor,
      inactiveColor:
          Color.lerp(inactiveColor, other.inactiveColor, t) ?? inactiveColor,
      pollutantToggleBgColor:
          Color.lerp(pollutantToggleBgColor, other.pollutantToggleBgColor, t) ??
              pollutantToggleBgColor,
      darkGreyColor:
          Color.lerp(darkGreyColor, other.darkGreyColor, t) ?? darkGreyColor,
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

  final Color? aqiGreen;
  final Color? aqiGreenTextColor;
  final Color? aqiYellow;
  final Color? aqiYellowTextColor;
  final Color? aqiOrange;
  final Color? aqiOrangeTextColor;
  final Color? aqiRed;
  final Color? aqiRedTextColor;
  final Color? aqiPurple;
  final Color? aqiPurpleTextColor;
  final Color? aqiMaroon;
  final Color? aqiMaroonTextColor;

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
      aqiRedTextColor: aqiRedTextColor ?? this.aqiRedTextColor,
      aqiPurple: aqiPurple ?? this.aqiPurple,
      aqiPurpleTextColor: aqiPurpleTextColor ?? this.aqiPurpleTextColor,
      aqiMaroon: aqiMaroon ?? this.aqiMaroon,
      aqiMaroonTextColor: aqiMaroonTextColor ?? this.aqiMaroonTextColor,
      aqiRed: aqiRed ?? this.aqiRed,
    );
  }

  @override
  AqiColors lerp(ThemeExtension<AqiColors>? other, double t) {
    if (other is! AqiColors) {
      return this;
    }

    return AqiColors(
      aqiGreen: Color.lerp(aqiGreen, other.aqiGreen, t),
      aqiGreenTextColor:
          Color.lerp(aqiGreenTextColor, other.aqiGreenTextColor, t),
      aqiYellow: Color.lerp(aqiYellow, other.aqiYellow, t),
      aqiYellowTextColor:
          Color.lerp(aqiYellowTextColor, other.aqiYellowTextColor, t),
      aqiOrange: Color.lerp(aqiOrange, other.aqiOrange, t),
      aqiOrangeTextColor:
          Color.lerp(aqiOrangeTextColor, other.aqiOrangeTextColor, t),
      aqiRedTextColor: Color.lerp(aqiRedTextColor, other.aqiRedTextColor, t),
      aqiPurple: Color.lerp(aqiPurple, other.aqiPurple, t),
      aqiPurpleTextColor:
          Color.lerp(aqiPurpleTextColor, other.aqiPurpleTextColor, t),
      aqiMaroon: Color.lerp(aqiMaroon, other.aqiMaroon, t),
      aqiMaroonTextColor:
          Color.lerp(aqiMaroonTextColor, other.aqiMaroonTextColor, t),
      aqiRed: Color.lerp(aqiRed, other.aqiRed, t),
    );
  }
}

class CustomColors {
  static Color get appBodyColor => const Color(0xffF2F1F6);

  static Color get appColorBlack => const Color(0xff121723);

  static Color get appColorBlue => const Color(0xff145DFF);

  static Color get appColorDisabled => appColorBlue.withOpacity(0.5);

  static Color get appLoadingColor => const Color(0xff145DFF).withOpacity(0.2);

  static Color get appPicColor => const Color(0xffFF79C1);

  static Color get appErrorColor => const Color(0xffEF5DA8);

  static Color get darkGreyColor => const Color(0xffADAFB6);

  static Color get greyColor => const Color(0xffD1D3D9);

  static Color get snackBarBgColor => appColorBlack.withOpacity(0.8);

  static Color get toolTipGreyColor => Colors.white.withOpacity(0.32);

  static Color get inactiveColor => appColorBlack.withOpacity(0.4);

  static Color get pollutantToggleBgColor => const Color(0xffF5F8FF);

  static Color get aqiGreen => const Color(0xff3AFF38);

  static Color get aqiGreenTextColor => const Color(0xff03B600);

  static Color get aqiYellow => const Color(0xffFFFF35);

  static Color get aqiYellowTextColor => const Color(0xffA8A800);

  static Color get aqiOrange => const Color(0xffFE9E35);

  static Color get aqiOrangeTextColor => const Color(0xffB86000);

  static Color get aqiRed => const Color(0xffFF4034);

  static Color get aqiRedTextColor => const Color(0xffB80B00);

  static Color get aqiPurple => const Color(0xFFDD38FF);

  static Color get aqiPurpleTextColor => const Color(0xff8E00AC);

  static Color get aqiMaroon => const Color(0xffA51F3F);

  static Color get aqiMaroonTextColor => const Color(0xffDBA5B2);
}
