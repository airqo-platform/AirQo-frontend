import 'dart:ui';

import 'package:flutter/foundation.dart';

class LocaleProvider extends ChangeNotifier {
  Locale? _locale;

  Locale? get locale => _locale;

  void setLocale(Locale locale) {
    // if (!L10n.all.contains(_locale)) return;
    print(locale.languageCode);
    _locale = const Locale('lg');
    notifyListeners();
  }
}
