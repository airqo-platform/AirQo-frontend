import 'package:flutter/material.dart';

class LocaleProvider extends ChangeNotifier {
  Locale? _locale;

  Locale? get locale => _locale;

  void setLocale(Locale locale) {
    // if (!L10n.all.contains(_locale)) return;
    debugPrint(locale.languageCode);
    _locale = locale;
    notifyListeners();
  }
}
