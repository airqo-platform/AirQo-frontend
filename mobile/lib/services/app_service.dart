import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:app_repository/app_repository.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

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
              await CloudAnalytics.logEvent(AnalyticsEvent.deletedAccount);
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

  Future<void> fetchData(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(
        buildContext,
        notifyUser: true,
      ),
      refreshAirQualityReadings(),
      fetchFavPlacesInsights(),
      updateFavouritePlacesReferenceSites(),
      Profile.syncProfile(),
    ]);
  }

  Future<void> fetchFavPlacesInsights() async {
    try {
      final favPlaces =
          Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();
      final placeIds = <String>[];

      for (final favPlace in favPlaces) {
        placeIds.add(favPlace.referenceSite);
      }
      await fetchInsights(
        placeIds,
        reloadDatabase: true,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  Future<List<Insights>> fetchInsights(
    List<String> siteIds, {
    Frequency? frequency,
    bool reloadDatabase = false,
  }) async {
    final insights = <Insights>[];
    final futures = <Future<List<Insights>>>[];

    for (var i = 0; i < siteIds.length; i = i + 2) {
      final site1 = siteIds[i];
      try {
        final site2 = siteIds[i + 1];
        futures.add(AirqoApiClient().fetchSitesInsights('$site1,$site2'));
      } catch (e) {
        futures.add(AirqoApiClient().fetchSitesInsights(site1));
      }
    }

    final sitesInsights = await Future.wait(futures);
    for (final result in sitesInsights) {
      insights.addAll(result);
    }

    await DBHelper().insertInsights(
      insights,
      siteIds,
      reloadDatabase: reloadDatabase,
    );

    if (frequency != null) {
      return insights
          .where((element) => element.frequency == frequency.toString())
          .toList();
    }

    return insights;
  }

  Future<void> refreshAirQualityReadings() async {
    try {
      final siteReadings = await AppRepository(
        airqoApiKey: Config.airqoApiToken,
        baseUrl: Config.airqoApiUrl,
      ).getSitesReadings();
      await HiveService.updateAirQualityReadings(siteReadings);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<bool> _clearUserLocalStorage() async {
    await Future.wait([
      SharedPreferencesHelper.clearPreferences(),
      HiveService.clearUserData(),
      SecureStorage().clearUserData(),
    ]);

    return true;
  }

  Future<void> _postAnonymousLoginActions() async {
    await Profile.getProfile();
  }

  Future<void> _postLoginActions() async {
    try {
      await Future.wait([
        Profile.syncProfile(),
        CloudStore.getCloudAnalytics(),
        CloudAnalytics.logPlatformType(),
        updateFavouritePlacesReferenceSites(),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _postSignUpActions() async {
    try {
      await Future.wait([
        Profile.getProfile(),
        CloudAnalytics.logEvent(
          AnalyticsEvent.createUserProfile,
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
      final profile = await Profile.getProfile();
      final placesUpdated = await CloudStore.updateFavouritePlaces();
      final analyticsUpdated = await CloudStore.updateCloudAnalytics();
      final profileUpdated = await profile.update(logout: true);
      final localStorageCleared = await _clearUserLocalStorage();

      if (placesUpdated &&
          analyticsUpdated &&
          profileUpdated &&
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

  Future<void> refreshDashboard(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(
        buildContext,
        notifyUser: true,
      ),
      refreshAirQualityReadings(),
      updateFavouritePlacesReferenceSites(),
    ]);
  }

  Future<void> updateFavouritePlacesReferenceSites() async {
    final favouritePlaces =
        Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();
    final updatedFavouritePlaces = <FavouritePlace>[];
    for (final favPlace in favouritePlaces) {
      final nearestSite = await LocationService.getNearestSiteAirQualityReading(
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
}
