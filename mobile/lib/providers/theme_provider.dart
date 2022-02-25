import 'package:app/constants/config.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeController extends ChangeNotifier {
  final SharedPreferences _prefs;

  String _currentTheme = 'light';

  ThemeController(this._prefs) {
    _currentTheme = _prefs.getString(Config.prefAppTheme) ?? 'light';
  }

  String get currentTheme => _currentTheme;

  void setTheme(String theme) {
    _currentTheme = theme;
    notifyListeners();

    _prefs.setString(Config.prefAppTheme, theme);
  }

  static ThemeController of(BuildContext context) {
    final provider =
        context.dependOnInheritedWidgetOfExactType<ThemeControllerProvider>()
            as ThemeControllerProvider;
    return provider.controller;
  }
}

class ThemeControllerProvider extends InheritedWidget {
  final ThemeController controller;

  const ThemeControllerProvider(
      {Key? key, required this.controller, required Widget child})
      : super(key: key, child: child);

  @override
  bool updateShouldNotify(ThemeControllerProvider oldWidget) =>
      controller != oldWidget.controller;
}
