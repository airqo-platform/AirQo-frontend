import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesHelper {
  static Future<String> getOnBoardingPage() async {
    final sharedPreferences = await SharedPreferences.getInstance();

    return sharedPreferences.getString(Config.prefOnBoardingPage) ?? 'welcome';
  }

  static Future<void> updateOnBoardingPage(
    OnBoardingPage currentBoardingPage,
  ) async {
    final sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setString(
      Config.prefOnBoardingPage,
      currentBoardingPage.toString(),
    );
  }

  static Future<void> updatePreference(
    String key,
    dynamic value,
    String type,
  ) async {
    try {
      final sharedPreferences = await SharedPreferences.getInstance();
      if (type == 'bool') {
        await sharedPreferences.setBool(key, value as bool);
      } else if (type == 'double') {
        await sharedPreferences.setDouble(key, value as double);
      } else if (type == 'int') {
        await sharedPreferences.setInt(key, value as int);
      } else {
        await sharedPreferences.setString(key, value as String);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
}
