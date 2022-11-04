import 'dart:async';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesHelper {
  static Future<void> clearPreferences() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    if (sharedPreferences.containsKey('notifications')) {
      await sharedPreferences.remove('notifications');
    }
    if (sharedPreferences.containsKey('aqShares')) {
      await sharedPreferences.remove('aqShares');
    }
    if (sharedPreferences.containsKey('location')) {
      await sharedPreferences.remove('location');
    }
    if (sharedPreferences.containsKey('alerts')) {
      await sharedPreferences.remove('alerts');
    }
  }

  static Future<String> getOnBoardingPage() async {
    final sharedPreferences = await SharedPreferences.getInstance();

    return sharedPreferences.getString(Config.prefOnBoardingPage) ?? 'welcome';
  }

  static Future<UserPreferences> getPreferences() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    final notifications = sharedPreferences.getBool('notifications') ?? false;
    final location = sharedPreferences.getBool('location') ?? false;
    final aqShares = sharedPreferences.getInt('aqShares') ?? 0;

    return UserPreferences(
      location: location,
      notifications: notifications,
      aqShares: aqShares,
    );
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
