import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'firebase_service.dart';
import 'hive_service.dart';
import 'rest_api.dart';

class AppService {
  factory AppService() {
    return _instance;
  }

  AppService._internal();

  static final AppService _instance = AppService._internal();

  static Future<void> postSignInActions(BuildContext context) async {
    context.read<ProfileBloc>().add(const SyncProfile());
    context.read<KyaBloc>().add(const SyncKya());
    context.read<LocationHistoryBloc>().add(const SyncLocationHistory());
    context.read<FavouritePlaceBloc>().add(const SyncFavouritePlaces());
    context.read<NotificationBloc>().add(const SyncNotifications());
    context.read<SearchBloc>().add(const ClearSearchHistory());
    Profile profile = context.read<ProfileBloc>().state;
    await CloudAnalytics.logSignInEvents(profile);
  }

  static Future<void> postSignOutActions(BuildContext context,
      {bool log = true}) async {
    context.read<ProfileBloc>().add(const ClearProfile());
    context.read<KyaBloc>().add(const ClearKya());
    context.read<FavouritePlaceBloc>().add(const ClearFavouritePlaces());
    context.read<NotificationBloc>().add(const ClearNotifications());
    context.read<SearchBloc>().add(const ClearSearchHistory());
    if (log) {
      await CloudAnalytics.logSignOutEvents();
    }
  }

  static Future<Kya?> getKya(Kya kya) async {
    if (!kya.isEmpty()) return kya;

    final bool isConnected = await hasNetworkConnection();
    if (!isConnected) {
      throw NetworkConnectionException('No internet Connection');
    }
    try {
      List<Kya> kyaList = await CloudStore.getKya();
      List<Kya> cloudKya =
          kyaList.where((element) => element.id == kya.id).toList();

      return cloudKya.isEmpty ? null : cloudKya.first;
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);

      return null;
    }
  }

  Future<bool> refreshAirQualityReadings() async {
    try {
      final airQualityReadings =
          await AirqoApiClient().fetchAirQualityReadings();
      await HiveService().updateAirQualityReadings(airQualityReadings);

      return true;
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return false;
    }
  }

  Future<void> setShowcase(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, true);
  }

  Future<void> stopShowcase(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, false);
  }

  Future<void> clearShowcase() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(Config.homePageShowcase);
    await prefs.remove(Config.forYouPageShowcase);
    await prefs.remove(Config.settingsPageShowcase);
  }

  Future<void> navigateShowcaseToScreen(
    BuildContext context,
    Widget screen,
  ) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => screen,
      ),
    );
  }

  Future<AppStoreVersion?> latestVersion() async {
    AppStoreVersion? appStoreVersion;

    try {
      final PackageInfo packageInfo = await PackageInfo.fromPlatform();

      if (Platform.isAndroid) {
        appStoreVersion = await AirqoApiClient()
            .getAppVersion(packageName: packageInfo.packageName);
      } else if (Platform.isIOS) {
        appStoreVersion = await AirqoApiClient()
            .getAppVersion(bundleId: packageInfo.packageName);
      } else {
        return appStoreVersion;
      }

      if (appStoreVersion == null) return null;

      return appStoreVersion.compareVersion(packageInfo.version) >= 1
          ? appStoreVersion
          : null;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return appStoreVersion;
  }
}
