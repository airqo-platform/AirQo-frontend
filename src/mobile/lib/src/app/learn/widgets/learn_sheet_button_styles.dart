import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

ButtonStyle learnExposurePrimaryButtonStyle({bool enabled = true}) {
  return ElevatedButton.styleFrom(
    backgroundColor: enabled ? AppColors.primaryColor : AppColors.dividerColorlight,
    foregroundColor: enabled ? Colors.white : AppColors.boldHeadlineColor3,
    elevation: 0,
    minimumSize: const Size(double.infinity, 48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
  );
}

ButtonStyle learnExposureSecondaryButtonStyle(BuildContext context) {
  return OutlinedButton.styleFrom(
    foregroundColor: AppColors.boldHeadlineColor4,
    side: BorderSide(color: AppColors.dividerColorlight),
    minimumSize: const Size(double.infinity, 48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
  );
}
