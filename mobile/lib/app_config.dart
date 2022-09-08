import 'package:flutter/material.dart';

// 1
enum Environment { dev, prod }

// 2
class AppConfig extends InheritedWidget {
  // 3
  final Environment environment;
  final String appTitle;

  // 4
  const AppConfig({
    Key? key,
    required Widget child,
    required this.environment,
    required this.appTitle,
  }) : super(
          key: key,
          child: child,
        );

  // 5
  static AppConfig of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppConfig>()!;
  }

  // 6
  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
}
