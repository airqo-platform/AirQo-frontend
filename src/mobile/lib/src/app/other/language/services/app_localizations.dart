import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loggy/loggy.dart';

class AppLocalizations with UiLoggy {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  Map<String, String> _localizedStrings = {};

  Future<bool> load() async {
    try {
      String jsonString = await rootBundle
          .loadString('assets/lang/${locale.languageCode}.json');
      Map<String, dynamic> jsonMap = json.decode(jsonString);
      _localizedStrings = _flattenJson(jsonMap);
      loggy.info(
          'Loaded translations for ${locale.languageCode}: $_localizedStrings');
      return true;
    } catch (_) {
      // Static JSON assets are not bundled for this locale.
      // Translations are handled dynamically via SunbirdTranslationService.
      return false;
    }
  }

  Map<String, String> _flattenJson(Map<String, dynamic> jsonMap,
      [String prefix = '']) {
    Map<String, String> flatMap = {};
    jsonMap.forEach((key, value) {
      String newKey = prefix.isEmpty ? key : '$prefix.$key';
      if (value is Map<String, dynamic>) {
        flatMap.addAll(_flattenJson(value, newKey));
      } else {
        flatMap[newKey] = value.toString();
      }
    });
    return flatMap;
  }

  String translate(String key, [Map<String, String>? variables]) {
    String? value = _localizedStrings[key];

    if (variables != null && value != null) {
      variables.forEach((varKey, varValue) {
        value = value?.replaceAll('{$varKey}', varValue);
      });
    }
    return value ?? key;
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'fr', 'sw', 'lg', 'pt'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    AppLocalizations localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
