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
  static Color darkHighlight = Color(0xFF2E2F33);      // Darker highlight for cards in dark theme
  static Color lightHighlight = Color(0xFFF3F6F8);     // Highlight color for light theme

}

/// Theme-aware text and feedback colors — white primary / grey secondary in dark mode.
class AppTextColors {
  const AppTextColors._();

  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  /// Primary titles: location names, readings, sheet titles.
  static Color headline(BuildContext context) =>
      isDark(context) ? Colors.white : AppColors.boldHeadlineColor4;

  /// Secondary labels and supporting copy.
  static Color muted(BuildContext context) => isDark(context)
      ? AppColors.boldHeadlineColor2
      : AppColors.boldHeadlineColor3;

  /// Captions, metadata, section subtitles.
  static Color subtitle(BuildContext context) => isDark(context)
      ? AppColors.secondaryHeadlineColor2
      : AppColors.secondaryHeadlineColor4;

  static Color successBackground(BuildContext context) => isDark(context)
      ? const Color(0xff57D175).withValues(alpha: 0.18)
      : const Color(0xffEAF3DE);

  static Color successForeground(BuildContext context) => isDark(context)
      ? Colors.white
      : const Color(0xff27500A);

  static Color errorBackground(BuildContext context) => isDark(context)
      ? const Color(0xffE24B4A).withValues(alpha: 0.18)
      : const Color(0xffFCEBEB);

  static Color errorForeground(BuildContext context) =>
      isDark(context) ? Colors.white : const Color(0xffE24B4A);

  static Color sheetBackground(BuildContext context) =>
      AppSurfaceColors.sheet(context);

  /// Close icon on modal sheets — white in dark mode.
  static Color modalCloseIcon(BuildContext context) =>
      isDark(context) ? Colors.white : AppColors.boldHeadlineColor4;
}

/// Bordered status-banner palette matching the Figma "Alert" component
/// (WM-Rebrand-Jam, node 187:2721) — distinct from [AppTextColors]'s older
/// error/success pair, which predates this rebrand's colour scale. Only the
/// tones currently in use (Error, Success) are defined here.
class AppAlertColors {
  const AppAlertColors._();

  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color errorBackground(BuildContext context) => isDark(context)
      ? const Color(0xffB42318).withValues(alpha: 0.16)
      : const Color(0xffFFFBFA); // Error/25

  static Color errorBorder(BuildContext context) => isDark(context)
      ? const Color(0xffB42318).withValues(alpha: 0.4)
      : const Color(0xffFDA29B); // Error/300

  static Color errorForeground(BuildContext context) =>
      isDark(context) ? Colors.white : const Color(0xffB42318); // Error/700

  static Color successBackground(BuildContext context) => isDark(context)
      ? const Color(0xff027A48).withValues(alpha: 0.16)
      : const Color(0xffF6FEF9); // Success/25

  static Color successBorder(BuildContext context) => isDark(context)
      ? const Color(0xff027A48).withValues(alpha: 0.4)
      : const Color(0xff6CE9A6); // Success/300

  static Color successForeground(BuildContext context) =>
      isDark(context) ? Colors.white : const Color(0xff027A48); // Success/700
}

/// Theme-aware surfaces and borders — one palette for cards, sheets, and modals.
class AppSurfaceColors {
  const AppSurfaceColors._();

  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  /// Bottom sheets, modals, and full-screen overlay pages.
  static Color sheet(BuildContext context) =>
      isDark(context) ? AppColors.darkHighlight : Colors.white;

  /// Cards and elevated panels on the scaffold background.
  static Color card(BuildContext context) =>
      isDark(context) ? AppColors.darkHighlight : Colors.white;

  /// Inset wells inside cards and sheets (icon chips, stat tiles).
  static Color nested(BuildContext context) =>
      isDark(context) ? AppColors.darkThemeBackground : AppColors.highlightColor;

  /// Standard dividers and card borders.
  static Color border(BuildContext context) =>
      isDark(context) ? AppColors.dividerColordark : AppColors.dividerColorlight;

  static BorderSide borderSide(BuildContext context, {double width = 1}) =>
      BorderSide(color: border(context), width: width);

  static BoxDecoration elevatedCardDecoration(
    BuildContext context, {
    double radius = 12,
  }) {
    final dark = isDark(context);
    return BoxDecoration(
      color: card(context),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: border(context)),
      boxShadow: dark
          ? null
          : [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
    );
  }

  static BoxDecoration sheetDecoration(
    BuildContext context, {
    double topRadius = 20,
  }) {
    return BoxDecoration(
      color: sheet(context),
      borderRadius: BorderRadius.vertical(top: Radius.circular(topRadius)),
    );
  }

  /// Inset panel on modal/sheet surfaces — darker than [sheet] for contrast.
  static BoxDecoration sheetPanelDecoration(
    BuildContext context, {
    double radius = 16,
  }) {
    return BoxDecoration(
      color: nested(context),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: border(context)),
    );
  }

  /// Inactive chips/buttons sitting on a nested panel.
  static Color panelChip(BuildContext context) =>
      isDark(context) ? AppColors.darkHighlight : Colors.white;
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
        backgroundColor: const Color(0xffF6F6F7)),
    brightness: Brightness.light,
    primaryColor: const Color(0xff145FFF),
    scaffoldBackgroundColor: const Color(0xffF6F6F7),
    cardColor: const Color(0xffFFFFFF),
    dividerColor: const Color(0xffE1E7EC),
    highlightColor: const Color(0xffC6D1DB), 
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
    cardColor: const Color(0xff2E2F33),
    dividerColor: AppColors.dividerColordark,
    highlightColor: const Color(0xff2E2F33),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: AppColors.boldHeadlineColor2,
      ),
      headlineSmall: TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: TextStyle(color: Colors.white),
      titleLarge: TextStyle(
        fontSize: 40,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
      bodyLarge: TextStyle(
        color: AppColors.boldHeadlineColor2,
        fontWeight: FontWeight.w500,
      ),
      bodyMedium: TextStyle(color: AppColors.secondaryHeadlineColor2),
      bodySmall: TextStyle(color: AppColors.secondaryHeadlineColor2),
      labelLarge: TextStyle(color: AppColors.boldHeadlineColor2),
      labelMedium: TextStyle(color: AppColors.secondaryHeadlineColor2),
    ),
  );
}
