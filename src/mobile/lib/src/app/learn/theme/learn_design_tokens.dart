import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Design tokens for the Learn tab — aligned with Exposure + HTML prototype.
class LearnDesignTokens {
  const LearnDesignTokens._();

  static const Color success = Color(0xff57D175);
  static const Color successBg = Color(0xffEAF3DE);
  static const Color successText = Color(0xff27500A);
  static const Color error = Color(0xffE24B4A);
  static const Color errorBg = Color(0xffFCEBEB);
  static const Color disabled = Color(0xffB0B5BC);
  static const Color footerGradient = Color(0xC2121212);

  static Color primary(BuildContext context) => AppColors.primaryColor;
  static Color headline(BuildContext context) => AppColors.boldHeadlineColor4;
  static Color muted(BuildContext context) => AppColors.boldHeadlineColor3;
  static Color divider(BuildContext context) => AppColors.dividerColorlight;
  static Color screenBg(BuildContext context) =>
      Theme.of(context).scaffoldBackgroundColor;
  static Color cardBg(BuildContext context) => Theme.of(context).cardColor;

  static const double sheetTopRadius = 20;
  static const double portraitCardRadius = 16;
  static const double activityCardRadius = 12;
  static const double pillRadius = 40;
  static const double tabPillRadius = 30;
  static const double horizontalPadding = 16;

  static Widget dragHandle(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 10, bottom: 8),
      height: 4,
      width: 36,
      decoration: BoxDecoration(
        color: muted(context).withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(2),
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

  static TextStyle activitySubtitle(BuildContext context) => TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: muted(context),
      );
}
