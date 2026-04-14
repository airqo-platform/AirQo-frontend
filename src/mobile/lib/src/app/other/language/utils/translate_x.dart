import 'package:flutter/material.dart';
import 'package:airqo/src/app/other/language/services/app_localizations.dart';

extension TranslateX on BuildContext {
  String tr(String key) => AppLocalizations.of(this).translate(key);
}