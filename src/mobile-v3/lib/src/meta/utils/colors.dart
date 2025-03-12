import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();
  
  // Primary colors
  static Color primaryColor = Color(0xFF145FFF);       // Primary/600 (airqo-blue-brand)
  static Color primaryLight = Color(0xFF297EFF);       // Primary/500
  static Color primaryLighter = Color(0xFFD6E9FF);     // Primary/100
  
  // Green indicators
  static Color greenLight = Color(0xFF8FE6A4);         // Secondary/aq-green/300
  static Color greenDark = Color(0xFF34C759);          // Secondary/aq-green/500
  
  // Purple indicators
  static Color purpleLight = Color(0xFFDBB6F1);        // Secondary/aq-purple/300
  static Color purpleDark = Color(0xFFAC5CD9);         // Secondary/aq-purple/500
  
  // Light theme colors
  static Color lightBackground = Color(0xFFF9FAFB);    // Background color for light theme
  static Color lightHighlight = Color(0xFFF3F6F8);     // Highlight color for light theme
  static Color lightCardBg = Color(0xFFFFFFFF);        // Card background for light theme
  static Color lightBorder = Color(0xFFE1E7EC);        // Border color for light theme
  
  // Dark theme colors
  static Color darkBackground = Color(0xFF1C1D20);     // Secondary/neutral-dark/nd950-dark - Background for dark theme
  static Color darkHighlight = Color(0xFF2E2F33);      // Darker highlight for cards in dark theme
  static Color darkCardBg = Color(0xFF2E2F33);         // Card background for dark theme
  
  // Text colors - Light theme
  static Color textDarkest = Color(0xFF000000);        // Darkest text for light theme
  static Color textDark = Color(0xFF3F4B5F);           // Secondary/neutral-light/nl700-title - Dark text for light theme
  static Color textMedium = Color(0xFF6F87A1);         // Secondary/neutral-light/nl400-body - Medium text for light theme
  static Color textLight = Color(0xFF9EB0C2);          // Secondary/neutral-light/nl300-placeholder - Light text for light theme
  
  // Text colors - Dark theme
  static Color darkTextPrimary = Color(0xFFFFFFFF);    // Primary text for dark theme
  static Color darkTextSecondary = Color(0xFF9EA3AA);  // Secondary/neutral-light/nl300 - Secondary text for dark theme
  static Color darkTextTertiary = Color(0xFF60646C);   // Secondary/neutral-dark/nd500 - Tertiary text for dark theme
  
  // Accent colors
  static Color accentBlue = Color(0xFF0A46EB);         // Primary/700 - Deeper blue
  static Color buttonHighlight = Color(0xFF145FFF);    // Primary button color
  
  // Retaining original colors from the provided code
  static Color backgroundColor = Color(0xffF9FAFB);
  static Color backgroundColor2 = Color(0xffFAFAFA);
  static Color borderColor2 = Color(0xffE1E7EC);
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
}

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    splashColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      scrolledUnderElevation: 0,
      elevation: 0,
      backgroundColor: AppColors.lightBackground,
      iconTheme: IconThemeData(color: AppColors.textDarkest),
      titleTextStyle: TextStyle(color: AppColors.textDarkest, fontWeight: FontWeight.bold, fontSize: 20),
    ),
    brightness: Brightness.light,
    primaryColor: AppColors.primaryColor,
    scaffoldBackgroundColor: AppColors.lightBackground,
    highlightColor: AppColors.lightHighlight,
    cardColor: AppColors.lightCardBg,
    cardTheme: CardTheme(
      color: AppColors.lightCardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.lightBorder, width: 1),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.buttonHighlight,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    tabBarTheme: TabBarTheme(
      labelColor: AppColors.textDarkest,
      unselectedLabelColor: AppColors.textMedium,
      indicatorColor: AppColors.primaryColor,
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: AppColors.textDarkest,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: AppColors.textDarkest,
      ),
      headlineSmall: TextStyle(
        color: AppColors.textDark,
      ),
      titleMedium: TextStyle(
        color: AppColors.textDarkest,
      ),
      titleLarge: TextStyle(
        fontSize: 40, 
        fontWeight: FontWeight.w700, 
        color: AppColors.textDarkest,
      ),
      bodyLarge: TextStyle(
        color: AppColors.textDark,
      ),
      bodyMedium: TextStyle(
        color: AppColors.textMedium,
      ),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    splashColor: Colors.transparent,
    fontFamily: "Inter",
    useMaterial3: true,
    appBarTheme: AppBarTheme(
      scrolledUnderElevation: 0,
      elevation: 0,
      backgroundColor: AppColors.darkBackground,
      iconTheme: IconThemeData(color: Colors.white),
      titleTextStyle: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
    ),
    brightness: Brightness.dark,
    primaryColor: AppColors.primaryColor,
    scaffoldBackgroundColor: AppColors.darkBackground,
    highlightColor: AppColors.darkHighlight,
    cardColor: AppColors.darkCardBg,
    cardTheme: CardTheme(
      color: AppColors.darkCardBg,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.transparent),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.buttonHighlight,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    tabBarTheme: TabBarTheme(
      labelColor: Colors.white,
      unselectedLabelColor: AppColors.darkTextSecondary,
      indicatorColor: AppColors.primaryColor,
    ),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: Colors.white,
      ),
      headlineSmall: TextStyle(
        color: AppColors.darkTextSecondary,
      ),
      titleMedium: TextStyle(
        color: Colors.white,
      ),
      titleLarge: TextStyle(
        fontSize: 40, 
        fontWeight: FontWeight.w700, 
        color: Colors.white,
      ),
      bodyLarge: TextStyle(
        color: AppColors.darkTextSecondary,
      ),
      bodyMedium: TextStyle(
        color: AppColors.darkTextTertiary,
      ),
    ),
  );
}