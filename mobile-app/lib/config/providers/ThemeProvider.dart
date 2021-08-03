import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

import 'package:shared_preferences/shared_preferences.dart';


class ThemeController extends ChangeNotifier {

  ThemeController(this._prefs) {
    _currentTheme = _prefs.getString(appTheme) ?? 'light';
  }

  final SharedPreferences _prefs;
  String _currentTheme = 'light';

  String get currentTheme => _currentTheme;

  void setTheme(String theme) {
    _currentTheme = theme;
    notifyListeners();

    _prefs.setString(appTheme, theme);
  }

  static ThemeController of(BuildContext context) {
    final provider =
    context.dependOnInheritedWidgetOfExactType<ThemeControllerProvider>()
    as ThemeControllerProvider;
    return provider.controller;
  }
}

class ThemeControllerProvider extends InheritedWidget {
  const ThemeControllerProvider({ Key? key,
    required this.controller, required Widget child})
      : super(key: key, child: child);

  final ThemeController controller;

  @override
  bool updateShouldNotify(ThemeControllerProvider old) =>
      controller != old.controller;
}