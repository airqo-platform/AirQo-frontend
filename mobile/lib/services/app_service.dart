import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'firebase_service.dart';
import 'hive_service.dart';
import 'rest_api.dart';
import 'secure_storage.dart';

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
    await CloudAnalytics.logSignInEvents();
  }

  static Future<void> postSignOutActions(BuildContext context) async {
    context.read<ProfileBloc>().add(const ClearProfile());
    context.read<KyaBloc>().add(const ClearKya());
    context.read<FavouritePlaceBloc>().add(const ClearFavouritePlaces());
    context.read<NotificationBloc>().add(const ClearNotifications());
    context.read<SearchBloc>().add(const ClearSearchHistory());
    await CloudAnalytics.logSignOutEvents();
  }

  Future<bool> authenticateUser({
    required AuthProcedure authProcedure,
    AuthCredential? authCredential,
  }) async {
    late bool authSuccessful;

    switch (authProcedure) {
      case AuthProcedure.login:
      case AuthProcedure.signup:
      case AuthProcedure.anonymousLogin:
        authSuccessful = await CustomAuth.firebaseSignIn(authCredential);
        break;

      case AuthProcedure.deleteAccount:
        final reAuthentication =
            await CustomAuth.reAuthenticate(authCredential!);
        if (reAuthentication) {
          final logging =
              await CloudAnalytics.logEvent(CloudAnalyticsEvent.deletedAccount);
          final localStorageDeletion = await _clearUserLocalStorage();
          if (logging && localStorageDeletion) {
            authSuccessful = await CustomAuth.deleteAccount();
          }
        } else {
          authSuccessful = false;
        }
        break;

      case AuthProcedure.logout:
      case AuthProcedure.none:
        authSuccessful = true;
        break;
    }

    if (authSuccessful) {
      switch (authProcedure) {
        case AuthProcedure.login:
          await _postLoginActions();
          break;
        case AuthProcedure.signup:
          await _postSignUpActions();
          break;
        case AuthProcedure.logout:
          return _postLogOutActions();
        case AuthProcedure.anonymousLogin:
          break;
        case AuthProcedure.deleteAccount:
        case AuthProcedure.none:
          break;
      }
    }

    return authSuccessful;
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

  Future<bool> doesUserExist({
    String? phoneNumber,
    String? emailAddress,
  }) async {
    try {
      if (emailAddress != null) {
        final methods = await FirebaseAuth.instance
            .fetchSignInMethodsForEmail(emailAddress);

        return methods.isNotEmpty;
      }

      return AirqoApiClient().checkIfUserExists(
        phoneNumber: phoneNumber,
        emailAddress: emailAddress,
      );
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);

      return true;
    }
  }

  static Future<List<Forecast>> fetchInsightsData(String siteId) async {
    List<Forecast> forecast = await AirqoApiClient().fetchForecast(siteId);
    await AirQoDatabase().insertForecast(forecast);

    return forecast;
  }

  Future<bool> refreshAirQualityReadings() async {
    try {
      final airQualityReadings =
          await AirqoApiClient().fetchAirQualityReadings();
      await HiveService.updateAirQualityReadings(airQualityReadings);

      return true;
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return false;
    }
  }

  Future<bool> _clearUserLocalStorage() async {
    await Future.wait([
      HiveService.clearUserData(),
      SecureStorage().clearUserData(),
    ]);

    return true;
  }

  Future<void> _postLoginActions() async {
    try {
      await Future.wait([
        CloudAnalytics.logPlatformType(),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
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
    await prefs.setBool(Config.restartTourShowcase, true);
  }

  Future<void> navigateShowcaseToScreen(
    BuildContext context,
    Widget screen,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => screen,
      ),
    );
  }

  Future<void> _postSignUpActions() async {
    try {
      await Future.wait([
        CloudAnalytics.logEvent(
          CloudAnalyticsEvent.createUserProfile,
        ),
        CloudAnalytics.logNetworkProvider(),
        CloudAnalytics.logPlatformType(),
        CloudAnalytics.logGender(),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<bool> _postLogOutActions() async {
    // TODO Login anonymously
    try {
      final placesUpdated = await CloudStore.updateFavouritePlaces([]);
      final analyticsUpdated = await CloudStore.updateLocationHistory([]);
      final localStorageCleared = await _clearUserLocalStorage();

      if (placesUpdated && analyticsUpdated && localStorageCleared) {
        return CustomAuth.logOut();
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
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
