import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// Matches Exposure sheet CTAs (label picker, dashboard empty state).
const double learnPrimaryButtonRadius = 12;

const TextStyle learnPrimaryButtonTextStyle = TextStyle(
  fontFamily: 'Inter',
  fontSize: 15,
  fontWeight: FontWeight.w600,
);

const TextStyle learnSecondaryButtonTextStyle = TextStyle(
  fontFamily: 'Inter',
  fontSize: 15,
  fontWeight: FontWeight.w600,
);

ButtonStyle learnExposurePrimaryButtonStyle({bool enabled = true}) {
  return ElevatedButton.styleFrom(
    backgroundColor:
        enabled ? AppColors.primaryColor : AppColors.dividerColorlight,
    foregroundColor: enabled ? Colors.white : AppColors.boldHeadlineColor3,
    elevation: 0,
    minimumSize: const Size(double.infinity, 48),
    padding: const EdgeInsets.symmetric(vertical: 14),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(learnPrimaryButtonRadius),
    ),
    textStyle: learnPrimaryButtonTextStyle,
  );
}

ButtonStyle learnExposureSecondaryButtonStyle(BuildContext context) {
  return OutlinedButton.styleFrom(
    foregroundColor: LearnDesignTokens.headline(context),
    side: BorderSide(color: LearnDesignTokens.divider(context)),
    minimumSize: const Size(double.infinity, 48),
    padding: const EdgeInsets.symmetric(vertical: 14),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(learnPrimaryButtonRadius),
    ),
    textStyle: learnSecondaryButtonTextStyle,
  );
}

/// Neutral filled button used on Exposure-style sheets (e.g. Done on completion).
ButtonStyle learnExposureNeutralButtonStyle(BuildContext context) {
  return ElevatedButton.styleFrom(
    backgroundColor: LearnDesignTokens.nestedSurface(context),
    foregroundColor: LearnDesignTokens.headline(context),
    elevation: 0,
    minimumSize: const Size(double.infinity, 48),
    padding: const EdgeInsets.symmetric(vertical: 14),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(learnPrimaryButtonRadius),
    ),
    textStyle: learnSecondaryButtonTextStyle,
  );
}
