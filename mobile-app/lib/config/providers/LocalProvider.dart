import 'package:app/config/languages/l10n.dart';
import 'package:flutter/cupertino.dart';

class localProvider extends ChangeNotifier {
  Locale? _locale;

  Locale? get locale => _locale;

  void setLocale(Locale locale) {
    if (!L10n.all.contains(_locale)) return;
    _locale = locale;
    notifyListeners();
  }
}
