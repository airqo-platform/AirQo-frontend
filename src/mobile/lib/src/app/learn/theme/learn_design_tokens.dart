import 'package:airqo/src/meta/utils/colors.dart';
import 'dart:ui';

import 'package:flutter/material.dart';

/// Design tokens for the Learn tab — aligned with Exposure + HTML prototype.
class LearnDesignTokens {
  const LearnDesignTokens._();

  static const Color success = Color(0xff57D175);
  static const Color error = Color(0xffE24B4A);
  static const Color disabled = Color(0xffB0B5BC);
  static const Color footerGradient = Color(0xC2121212);

  static Color successBg(BuildContext context) =>
      AppTextColors.successBackground(context);

  static Color successText(BuildContext context) =>
      AppTextColors.successForeground(context);

  static Color errorBg(BuildContext context) =>
      AppTextColors.errorBackground(context);

  static Color errorText(BuildContext context) =>
      AppTextColors.errorForeground(context);

  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color primary(BuildContext context) => AppColors.primaryColor;

  static Color headline(BuildContext context) => AppTextColors.headline(context);

  static Color muted(BuildContext context) => AppTextColors.muted(context);

  static Color subtitle(BuildContext context) => AppTextColors.subtitle(context);

  static Color divider(BuildContext context) => AppSurfaceColors.border(context);

  static Color sheetBg(BuildContext context) => AppSurfaceColors.sheet(context);

  static Color nestedSurface(BuildContext context) => AppSurfaceColors.nested(context);

  static Color iconBg(BuildContext context) => isDark(context)
      ? AppColors.darkThemeBackground
      : AppColors.dividerColorlight;

  static Color screenBg(BuildContext context) =>
      Theme.of(context).scaffoldBackgroundColor;

  static Color cardBg(BuildContext context) => AppSurfaceColors.card(context);

  static Color sheetTitleColor(BuildContext context) => headline(context);

  static Color sheetSubtitleColor(BuildContext context) => muted(context);

  static TextStyle completionTitle(BuildContext context) => TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.15,
        color: sheetTitleColor(context),
      );

  static TextStyle completionSubtitle(BuildContext context) => TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w500,
        height: 1.3,
        color: sheetSubtitleColor(context),
      );

  static TextStyle completionCaption(BuildContext context) => TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        height: 1.35,
        color: sheetSubtitleColor(context),
      );

  static const double sheetTopRadius = 20;
  static const double portraitCardRadius = 16;
  static const double activityCardRadius = 12;
  static const double pillRadius = 40;
  static const double tabPillRadius = 30;
  static const double horizontalPadding = 16;

  static Widget dragHandle(BuildContext context) {
    final handleColor = muted(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          width: 36,
          height: 4,
          decoration: BoxDecoration(
            color: handleColor.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      ),
    );
  }

  static Widget lessonProgressBar(
    BuildContext context, {
    required double value,
    bool complete = false,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(2),
      child: LinearProgressIndicator(
        value: value.clamp(0.0, 1.0),
        minHeight: 3,
        backgroundColor: divider(context),
        color: complete ? success : primary(context),
      ),
    );
  }

  static TextStyle slbl(BuildContext context) => TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: muted(context),
      );

  static TextStyle lessonLabel(BuildContext context) => TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.4,
        color: muted(context),
      );

  static TextStyle lessonTitle(BuildContext context) => TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.15,
        color: headline(context),
      );

  static TextStyle sectionSubtitle(BuildContext context) => TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w500,
        height: 1.35,
        color: subtitle(context),
      );

  static TextStyle activitySubtitle(BuildContext context) => TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: muted(context),
      );

  static const IconData completedCheckIcon = Icons.check_circle_outline;

  static Widget completedCheckIconWidget({double size = 18}) {
    return Icon(
      completedCheckIcon,
      size: size,
      color: success,
    );
  }

  static Widget lockedContentBlur({
    required Widget child,
    required BorderRadius borderRadius,
  }) {
    return ClipRRect(
      borderRadius: borderRadius,
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 1.2, sigmaY: 1.2),
        child: Opacity(opacity: 0.72, child: child),
      ),
    );
  }
}
