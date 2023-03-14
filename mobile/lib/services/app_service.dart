import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app/constants/constants.dart';

import 'firebase_service.dart';
import 'hive_service.dart';
import 'local_storage.dart';
import 'location_service.dart';
import 'rest_api.dart';
import 'secure_storage.dart';

class AppService {
  factory AppService() {
    return _instance;
  }

  AppService._internal();

  static final AppService _instance = AppService._internal();

  static Future<void> postSignOutActions(BuildContext context) async {
    context.read<ProfileBloc>().add(const ClearProfile());
    context.read<KyaBloc>().add(const ClearKya());
    context.read<AnalyticsBloc>().add(const ClearAnalytics());
    context.read<FavouritePlaceBloc>().add(const ClearFavouritePlaces());
    context.read<NotificationBloc>().add(const ClearNotifications());
    context.read<SearchBloc>().add(const ClearSearchHistory());

    // await Navigator.pushAndRemoveUntil(
    //   context,
    //   MaterialPageRoute(builder: (context) {
    //     return const PhoneLoginWidget();
    //   }),
    //       (r) => true,
    // );
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
          final cloudStoreDeletion = await CloudStore.deleteAccount();
          final logging =
              await CloudAnalytics.logEvent(CloudAnalyticsEvent.deletedAccount);
          final localStorageDeletion = await _clearUserLocalStorage();
          if (cloudStoreDeletion && logging && localStorageDeletion) {
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
          await _postAnonymousLoginActions();
          break;
        case AuthProcedure.deleteAccount:
        case AuthProcedure.none:
          break;
      }
    }

    return authSuccessful;
  }

  static Future<Kya?> getKya(String id) async {
    List<Kya> kya = Hive.box<Kya>(HiveBox.kya)
        .values
        .where((element) => element.id == id)
        .toList();

    if (kya.isNotEmpty) {
      return kya.first;
    }

    final bool isConnected = await hasNetworkConnection();
    if (!isConnected) {
      throw NetworkConnectionException('No internet Connection');
    }

    try {
      kya = await CloudStore.getKya();
      kya = kya.where((element) => element.id == id).toList();

      return kya.isEmpty ? null : kya.first;
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

  Future<InsightData> fetchInsightsData(
    String siteId, {
    Frequency? frequency,
  }) async {
    InsightData insights = await AirqoApiClient().fetchInsightsData(siteId);

    await AirQoDatabase().insertHistoricalInsights(insights.historical);
    await AirQoDatabase().insertForecastInsights(insights.forecast);

    if (frequency != null) {
      final historical = insights.historical
          .where((element) => element.frequency == frequency)
          .toList();
      final forecast = insights.forecast
          .where((element) => element.frequency == frequency)
          .toList();

      return InsightData(forecast: forecast, historical: historical);
    }

    return insights;
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

  Future<void> _postAnonymousLoginActions() async {
    await HiveService.getProfile();
  }

  Future<void> _postLoginActions() async {
    try {
      await Future.wait([
        CloudStore.getCloudAnalytics(),
        CloudAnalytics.logPlatformType(),
        updateFavouritePlacesReferenceSites(),
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
      final profile = await HiveService.getProfile();
      final placesUpdated = await CloudStore.updateFavouritePlaces();
      final analyticsUpdated = await CloudStore.updateCloudAnalytics();
      final localStorageCleared = await _clearUserLocalStorage();

      if (placesUpdated &&
          analyticsUpdated &&
          localStorageCleared) {
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

  Future<void> updateFavouritePlacesReferenceSites() async {
    final favouritePlaces =
        Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();
    final updatedFavouritePlaces = <FavouritePlace>[];
    for (final favPlace in favouritePlaces) {
      final nearestSite = await LocationService.getNearestSite(
        favPlace.latitude,
        favPlace.longitude,
      );
      if (nearestSite != null) {
        updatedFavouritePlaces
            .add(favPlace.copyWith(referenceSite: nearestSite.referenceSite));
      } else {
        updatedFavouritePlaces.add(favPlace);
      }
    }
    await HiveService.loadFavouritePlaces(updatedFavouritePlaces);
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
