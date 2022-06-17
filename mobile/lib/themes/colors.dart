import 'package:flutter/material.dart';

class CustomColors {
  static Color get appBodyColor => const Color(0xffF2F1F6);

  static Color get appColor => Colors.black;

  static Color get appColorBlack => const Color(0xff121723);

  static Color get appColorBlue => const Color(0xff145DFF);

  static Color get appColorDisabled => appColorBlue.withOpacity(0.5);

  static Color get appLoadingColor => const Color(0xffEBEAEF);

  static Color get appPicColor => const Color(0xffFF79C1);

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
