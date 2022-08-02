import 'package:app/app_config.dart';
import 'package:app/main_common.dart';
import 'package:flutter/material.dart';

void main() {
  var configuredApp = AppConfig(
    appTitle: 'AirQo Dev',
    environment: Environment.dev,
    child: AirQoApp(),
  );

  mainCommon();

  runApp(configuredApp);
}
