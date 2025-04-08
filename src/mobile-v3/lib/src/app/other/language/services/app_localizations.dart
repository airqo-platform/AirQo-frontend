import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppLocalizations {
  final Locale locale;
  
  AppLocalizations(this.locale);
  
  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  Map<String, String> _localizedStrings = {};

  Future<bool> load() async {
    try {
      String jsonString = await rootBundle.loadString('assets/lang/${locale.languageCode}.json');
      Map<String, dynamic> jsonMap = json.decode(jsonString);
      _localizedStrings = _flattenJson(jsonMap);
      print('Loaded translations for ${locale.languageCode}: $_localizedStrings');
      return true;
    } catch (e) {
      print('Error loading translations for ${locale.languageCode}: $e');
      return false;
    }
  }

  Map<String, String> _flattenJson(Map<String, dynamic> jsonMap, [String prefix = '']) {
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

  String translate(String key) {
    final value = _localizedStrings[key] ?? key;
    print('Translating "$key" to "$value" for ${locale.languageCode}');
    return value;
  }
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
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