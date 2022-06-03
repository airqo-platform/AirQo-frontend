import 'dart:io';

import 'package:app/models/place_details.dart';
import 'package:app/models/profile.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/hive_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/network.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';

import '../models/enum_constants.dart';
import '../models/insights.dart';
import '../models/kya.dart';
import '../models/notification.dart';
import '../utils/exception.dart';
import 'location_service.dart';

class AppService {
  factory AppService() {
    return _instance;
  }
  AppService._internal();
  static final AppService _instance = AppService._internal();

  Future<bool> authenticateUser({
    required AuthMethod authMethod,
    required AuthProcedure authProcedure,
    required BuildContext buildContext,
    String? emailAddress,
    String? emailAuthLink,
    AuthCredential? authCredential,
  }) async {
    final hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    bool authSuccessful;
    if (authMethod == AuthMethod.email &&
        emailAddress != null &&
        emailAuthLink != null) {
      authSuccessful = await CustomAuth.emailAuthentication(
          emailAddress, emailAuthLink, buildContext);
    } else if (authMethod == AuthMethod.phone && authCredential != null) {
      authSuccessful = await CustomAuth.phoneNumberAuthentication(
          authCredential, buildContext);
    } else {
      authSuccessful = false;
    }

    if (authSuccessful) {
      if (authProcedure == AuthProcedure.login) {
        await postLoginActions(buildContext);
      }
    }

    return authSuccessful;
  }

  Future<bool> deleteAccount(BuildContext buildContext) async {
    final hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    try {
      await Future.wait([
        CloudStore.deleteAccount(),
        CloudAnalytics.logEvent(AnalyticsEvent.deletedAccount),
        _clearUserLocalStorage(buildContext),
      ]).then((value) => CustomAuth.deleteAccount());
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
      return false;
    }
    return true;
  }

  Future<bool> doesUserExist(
      {String? phoneNumber,
      String? emailAddress,
      required BuildContext buildContext}) async {
    try {
      if (emailAddress != null) {
        final methods = await FirebaseAuth.instance
            .fetchSignInMethodsForEmail(emailAddress);
        return methods.isNotEmpty;
      }
      return AirqoApiClient().checkIfUserExists(
          phoneNumber: phoneNumber, emailAddress: emailAddress);
    } catch (exception, stackTrace) {
      debugPrint('$exception \n $stackTrace');
      await Future.wait([
        logException(exception, stackTrace),
        showSnackBar(buildContext, 'Failed to perform action. Try again later')
      ]);
      return true;
    }
  }

  Future<void> fetchData(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      fetchLatestMeasurements(),
      _loadKya(),
      _loadNotifications(),
      _loadFavPlaces(buildContext),
      fetchFavPlacesInsights(),
      updateFavouritePlacesSites(buildContext),
      Profile.syncProfile()
    ]);
  }

  Future<void> fetchFavPlacesInsights() async {
    try {
      final favPlaces = await DBHelper().getFavouritePlaces();
      final placeIds = <String>[];

      for (final favPlace in favPlaces) {
        placeIds.add(favPlace.siteId);
      }
      await fetchInsights(placeIds, reloadDatabase: true);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }

  Future<List<Insights>> fetchInsights(List<String> siteIds,
      {Frequency? frequency, bool reloadDatabase = false}) async {
    final insights = <Insights>[];
    final futures = <Future>[];

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

    await DBHelper()
        .insertInsights(insights, siteIds, reloadDatabase: reloadDatabase);

    if (frequency != null) {
      var frequencyInsights = <Insights>[];
      frequencyInsights = insights
          .where((element) => element.frequency == frequency.getName())
          .toList();
      return frequencyInsights;
    }

    return insights;
  }

  Future<void> _loadKya() async {
    try {
      final offlineKyas =
          Hive.box<Kya>(HiveBox.kya).values.toList().cast<Kya>();

      final cloudKyas = await CloudStore.getKya();
      var kyas = <Kya>[];
      if (offlineKyas.isEmpty) {
        kyas = cloudKyas;
      } else {
        for (final offlineKya in offlineKyas) {
          try {
            final kya = cloudKyas
                .where((element) => element.id.equalsIgnoreCase(offlineKya.id))
                .first
              ..progress = offlineKya.progress;
            kyas.add(kya);
          } catch (e) {
            debugPrint(e.toString());
          }
        }
      }
      await Kya.load(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> fetchLatestMeasurements() async {
    try {
      final measurements = await AirqoApiClient().fetchLatestMeasurements();
      if (measurements.isNotEmpty) {
        await DBHelper().insertLatestMeasurements(measurements);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  bool isLoggedIn() {
    return CustomAuth.isLoggedIn();
  }

  Future<void> _loadFavPlaces(BuildContext buildContext) async {
    try {
      final _offlineFavPlaces = await DBHelper().getFavouritePlaces();
      final _cloudFavPlaces =
          await CloudStore.getFavPlaces(CustomAuth.getUserId());

      for (final place in _offlineFavPlaces) {
        _cloudFavPlaces.removeWhere(
            (element) => element.placeId.equalsIgnoreCase(place.placeId));
      }

      final favPlaces = [..._offlineFavPlaces, ..._cloudFavPlaces];
      await Future.wait([
        DBHelper().setFavouritePlaces(favPlaces).then((value) => {
              Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                  .reloadFavouritePlaces(),
            }),
        CloudStore.updateFavPlaces(CustomAuth.getUserId(), favPlaces)
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _loadNotifications() async {
    try {
      final _offlineNotifications =
          Hive.box<AppNotification>(HiveBox.appNotifications)
              .values
              .toList()
              .cast<AppNotification>();

      final _cloudNotifications = await CloudStore.getNotifications();

      for (final notification in _offlineNotifications) {
        _cloudNotifications.removeWhere(
            (element) => element.id.equalsIgnoreCase(notification.id));
      }

      final notifications = [..._offlineNotifications, ..._cloudNotifications];

      await AppNotification.load(notifications);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<bool> logOut(buildContext) async {
    final hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    try {
      final userId = CustomAuth.getUserId();
      final profile = await Profile.getProfile();

      await Future.wait([
        DBHelper()
            .getFavouritePlaces()
            .then((value) => CloudStore.updateFavPlaces(userId, value)),
        profile.update(logout: true),
        CloudStore.updateCloudAnalytics(),
      ]).then((value) {
        CustomAuth.logOut();
        _clearUserLocalStorage(buildContext);
      });
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return true;
  }

  Future<void> _clearUserLocalStorage(BuildContext buildContext) async {
    await Future.wait([
      SharedPreferencesHelper.clearPreferences(),
      DBHelper().clearAccount().then((value) => {
            Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                .reloadFavouritePlaces()
          }),
      HiveService.clearUserData(),
      SecureStorage().clearUserData()
    ]);
  }

  Future<void> postLoginActions(BuildContext buildContext) async {
    try {
      await checkNetworkConnection(buildContext, notifyUser: true);
      await Future.wait([
        Profile.syncProfile(),
        CloudStore.getFavPlaces(CustomAuth.getUser()?.uid ?? '')
            .then((value) => {
                  if (value.isNotEmpty)
                    {
                      DBHelper().setFavouritePlaces(value),
                      Provider.of<PlaceDetailsModel>(buildContext,
                              listen: false)
                          .reloadFavouritePlaces(),
                    }
                }),
        CloudStore.getNotifications(),
        CloudStore.getCloudAnalytics(),
        logPlatformType(),
        _loadKya(),
        updateFavouritePlacesSites(buildContext)
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  static Future<void> postSignUpActions() async {
    try {
      await Future.wait([
        Profile.getProfile(),
        CloudAnalytics.logEvent(AnalyticsEvent.createUserProfile),
        logNetworkProvider(),
        logPlatformType(),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> refreshDashboard(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      fetchLatestMeasurements(),
      _loadKya(),
      _loadNotifications(),
      updateFavouritePlacesSites(buildContext),
    ]);
  }

  Future<void> refreshAnalytics(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      fetchLatestMeasurements(),
      _loadKya(),
      fetchFavPlacesInsights(),
    ]);
  }

  Future<void> refreshKyaView(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      _loadKya(),
    ]);
  }

  Future<void> refreshFavouritePlaces(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      fetchFavPlacesInsights(),
      updateFavouritePlacesSites(buildContext)
    ]);
  }

  Future<void> updateFavouritePlace(
      PlaceDetails placeDetails, BuildContext context) async {
    final isFav = await DBHelper().updateFavouritePlace(placeDetails);
    if (isFav) {
      await CloudStore.addFavPlace(CustomAuth.getUserId(), placeDetails);
    } else {
      await CloudStore.removeFavPlace(CustomAuth.getUserId(), placeDetails);
    }

    await Future.wait([
      Provider.of<PlaceDetailsModel>(context, listen: false)
          .reloadFavouritePlaces(),
      _logFavPlaces(),
    ]);
  }

  Future<void> updateFavouritePlacesSites(BuildContext buildContext) async {
    final favPlaces = await DBHelper().getFavouritePlaces();
    final updatedFavPlaces = <PlaceDetails>[];
    for (final favPlace in favPlaces) {
      final nearestSite = await LocationService.getNearestSite(
          favPlace.latitude, favPlace.longitude);
      if (nearestSite != null) {
        favPlace.siteId = nearestSite.id;
      }
      updatedFavPlaces.add(favPlace);
    }
    await DBHelper()
        .updateFavouritePlacesDetails(updatedFavPlaces)
        .then((value) => _loadFavPlaces(buildContext));
  }

  Future<void> _logFavPlaces() async {
    final favPlaces = await DBHelper().getFavouritePlaces();
    if (favPlaces.length >= 5) {
      await CloudAnalytics.logEvent(AnalyticsEvent.savesFiveFavorites);
    }
  }

  Future<void> logGender() async {
    final profile = Hive.box<Profile>(HiveBox.profile).getAt(0);
    if (profile != null) {
      if (profile.getGender() == Gender.male) {
        await CloudAnalytics.logEvent(AnalyticsEvent.maleUser);
      } else if (profile.getGender() == Gender.female) {
        await CloudAnalytics.logEvent(AnalyticsEvent.femaleUser);
      } else {
        await CloudAnalytics.logEvent(AnalyticsEvent.undefinedGender);
      }
    }
  }

  static Future<void> logNetworkProvider() async {
    final profile = Hive.box<Profile>(HiveBox.profile).getAt(0);
    if (profile != null) {
      final carrier = await AirqoApiClient().getCarrier(profile.phoneNumber);
      if (carrier.toLowerCase().contains('airtel')) {
        await CloudAnalytics.logEvent(AnalyticsEvent.airtelUser);
      } else if (carrier.toLowerCase().contains('mtn')) {
        await CloudAnalytics.logEvent(AnalyticsEvent.mtnUser);
      } else {
        await CloudAnalytics.logEvent(AnalyticsEvent.otherNetwork);
      }
    }
  }

  static Future<void> logPlatformType() async {
    if (Platform.isAndroid) {
      await CloudAnalytics.logEvent(AnalyticsEvent.androidUser);
    } else if (Platform.isIOS) {
      await CloudAnalytics.logEvent(AnalyticsEvent.iosUser);
    } else {
      debugPrint('Unknown Platform');
    }
  }
}
