import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/utils/network.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../models/enum_constants.dart';
import '../models/insights.dart';
import '../models/kya.dart';
import '../models/notification.dart';
import '../utils/exception.dart';
import 'native_api.dart';
import 'notifications_svc.dart';

class AppService {
  final DBHelper _dbHelper = DBHelper();
  final SecureStorage _secureStorage = SecureStorage();
  final AirqoApiClient _apiClient = AirqoApiClient();
  final SearchApi _searchApi = SearchApi();

  AirqoApiClient get apiClient => _apiClient;

  DBHelper get dbHelper => _dbHelper;

  SearchApi get searchApi => _searchApi;

  SecureStorage get secureStorage => _secureStorage;

  Future<bool> authenticateUser({
    required AuthMethod authMethod,
    required AuthProcedure authProcedure,
    required BuildContext buildContext,
    String? emailAddress,
    String? emailAuthLink,
    AuthCredential? authCredential,
  }) async {
    var hasConnection =
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
    var currentUser = CustomAuth.getUser();
    if (currentUser == null) {
      return false;
    }
    var hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    try {
      var id = currentUser.uid;
      await Future.wait([
        CloudStore.deleteAccount(id),
        logEvent(AnalyticsEvent.deletedAccount),
        _clearUserLocalStorage(buildContext),
      ]).then((value) => currentUser.delete());
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
        var methods = await FirebaseAuth.instance
            .fetchSignInMethodsForEmail(emailAddress);
        return methods.isNotEmpty;
      }
      return _apiClient.checkIfUserExists(
          phoneNumber: phoneNumber, emailAddress: emailAddress);
    } catch (exception, stackTrace) {
      debugPrint('$exception \n $stackTrace');
      await logException(exception, stackTrace);
      await showSnackBar(
          buildContext, 'Failed to perform action. Try again later');
      return true;
    }
  }

  Future<void> fetchData(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      _fetchLatestMeasurements(),
      _fetchKya(),
      _loadNotifications(),
      _loadFavPlaces(buildContext),
      fetchFavPlacesInsights(),
      updateFavouritePlacesSites(buildContext)
    ]);
  }

  Future<void> fetchFavPlacesInsights() async {
    try {
      var favPlaces = await _dbHelper.getFavouritePlaces();
      var placeIds = <String>[];

      for (var favPlace in favPlaces) {
        placeIds.add(favPlace.siteId);
      }
      await fetchInsights(placeIds, reloadDatabase: true);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<List<Insights>> fetchInsights(List<String> siteIds,
      {Frequency? frequency, bool reloadDatabase = false}) async {
    var insights = <Insights>[];
    var futures = <Future>[];

    for (var i = 0; i < siteIds.length; i = i + 2) {
      var site1 = siteIds[i];
      try {
        var site2 = siteIds[i + 1];
        futures.add(_apiClient.fetchSitesInsights('$site1,$site2'));
      } catch (e) {
        futures.add(_apiClient.fetchSitesInsights(site1));
      }
    }

    var sitesInsights = await Future.wait(futures);
    for (var result in sitesInsights) {
      insights.addAll(result);
    }

    await dbHelper.insertInsights(insights, siteIds,
        reloadDatabase: reloadDatabase);

    if (frequency != null) {
      var frequencyInsights = <Insights>[];
      frequencyInsights = insights
          .where((element) => element.frequency == frequency.getName())
          .toList();
      return frequencyInsights;
    }

    return insights;
  }

  Future<void> _fetchKya() async {
    try {
      var kyas = await CloudStore.getKya(CustomAuth.getUserId());
      await _dbHelper.insertKyas(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _fetchLatestMeasurements() async {
    try {
      var measurements = await _apiClient.fetchLatestMeasurements();
      if (measurements.isNotEmpty) {
        await _dbHelper.insertLatestMeasurements(measurements);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<UserDetails> getUserDetails() async {
    var userDetails = await _secureStorage.getUserDetails();
    return userDetails;
  }

  bool isLoggedIn() {
    return CustomAuth.isLoggedIn();
  }

  Future<void> _loadFavPlaces(BuildContext buildContext) async {
    try {
      var _offlineFavPlaces = await _dbHelper.getFavouritePlaces();
      var _cloudFavPlaces =
          await CloudStore.getFavPlaces(CustomAuth.getUserId());

      for (var place in _offlineFavPlaces) {
        _cloudFavPlaces.removeWhere(
            (element) => element.placeId.equalsIgnoreCase(place.placeId));
      }

      var favPlaces = [..._offlineFavPlaces, ..._cloudFavPlaces];
      await Future.wait([
        _dbHelper.setFavouritePlaces(favPlaces).then((value) => {
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
      var _offlineNotifications =
          Hive.box<AppNotification>(HiveBox.appNotifications)
              .values
              .toList()
              .cast<AppNotification>();

      var _cloudNotifications = await CloudStore.getNotifications();

      for (var notification in _offlineNotifications) {
        _cloudNotifications.removeWhere(
            (element) => element.id.equalsIgnoreCase(notification.id));
      }

      var notifications = [..._offlineNotifications, ..._cloudNotifications];

      await AppNotification.load(notifications);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> logEvent(AnalyticsEvent analyticsEvent) async {
    var loggedIn = isLoggedIn();
    await CloudAnalytics.logEvent(analyticsEvent, loggedIn);
  }

  Future<bool> logOut(buildContext) async {
    var hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    try {
      var userId = CustomAuth.getUserId();

      await Future.wait([
        _dbHelper
            .getFavouritePlaces()
            .then((value) => CloudStore.updateFavPlaces(userId, value)),
        CloudStore.updateProfileFields(userId, {'device': ''}),
        _clearUserLocalStorage(buildContext)
      ]).then((value) => CustomAuth.logOut(buildContext));
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return true;
  }

  Future<void> _clearUserLocalStorage(BuildContext buildContext) async {
    await Future.wait([
      _secureStorage.clearUserDetails(),
      SharedPreferencesHelper.clearPreferences(),
      _dbHelper.clearAccount().then((value) => {
            Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                .reloadFavouritePlaces()
          }),
      HiveStore.clearUserData()
    ]);
  }

  Future<void> postLoginActions(BuildContext buildContext) async {
    try {
      var user = CustomAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection = await checkNetworkConnection(buildContext);
      if (!hasConnection) {
        await showSnackBar(buildContext, Config.connectionErrorMessage);
        return;
      }

      var userDetails = await CloudStore.getProfile();

      var utcOffset = DateTime.now().getUtcOffset();
      var device = await CloudMessaging.getDeviceToken();
      if (device != null) {
        await CloudStore.updateProfileFields(
            user.uid, {'device': device, 'utcOffset': utcOffset});
      }

      await Future.wait([
        _secureStorage.updateUserDetails(userDetails),
        SharedPreferencesHelper.updatePreferences(userDetails.preferences),
        CloudStore.getFavPlaces(user.uid).then((value) => {
              if (value.isNotEmpty)
                {
                  _dbHelper.setFavouritePlaces(value),
                  Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                      .reloadFavouritePlaces(),
                }
            }),
        CloudStore.getNotifications(),
        _logPlatformType(),
        updateFavouritePlacesSites(buildContext)
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> postSignUpActions(BuildContext buildContext) async {
    try {
      var user = CustomAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection =
          await checkNetworkConnection(buildContext, notifyUser: true);
      if (!hasConnection) {
        return;
      }

      var userDetails = await CustomAuth.createProfile();

      if (userDetails == null) {
        return;
      }

      var device = await CloudMessaging.getDeviceToken();
      if (device != null) {
        userDetails.device = device;
      }

      await Future.wait([
        CloudStore.updateProfile(userDetails, user.uid),
        _secureStorage.updateUserDetails(userDetails),
        SharedPreferencesHelper.updatePreferences(userDetails.preferences),
        logEvent(AnalyticsEvent.createUserProfile),
        _logNetworkProvider(userDetails),
        _logGender(userDetails),
        _logPlatformType(),
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> refreshDashboard(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      _fetchLatestMeasurements(),
      _fetchKya(),
      _loadNotifications(),
      updateFavouritePlacesSites(buildContext),
    ]);
  }

  Future<void> refreshAnalytics(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      _fetchLatestMeasurements(),
      _fetchKya(),
      fetchFavPlacesInsights(),
    ]);
  }

  Future<void> refreshKyaView(BuildContext buildContext) async {
    await Future.wait([
      checkNetworkConnection(buildContext, notifyUser: true),
      _fetchKya(),
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
    var isFav = await _dbHelper.updateFavouritePlace(placeDetails);
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
    var favPlaces = await _dbHelper.getFavouritePlaces();
    var updatedFavPlaces = <PlaceDetails>[];
    for (var favPlace in favPlaces) {
      var nearestSite = await LocationService.getNearestSite(
          favPlace.latitude, favPlace.longitude);
      if (nearestSite != null) {
        favPlace.siteId = nearestSite.id;
      }
      updatedFavPlaces.add(favPlace);
    }
    await _dbHelper
        .updateFavouritePlacesDetails(updatedFavPlaces)
        .then((value) => _loadFavPlaces(buildContext));
  }

  Future<void> updateKya(Kya kya, BuildContext buildContext) async {
    await _dbHelper.updateKya(kya);
    var connected = await checkNetworkConnection(buildContext);
    if (CustomAuth.isLoggedIn() && connected) {
      await CloudStore.updateKyaProgress(CustomAuth.getUserId(), kya);
      if (kya.progress == kya.lessons.length) {
        await logEvent(AnalyticsEvent.completeOneKYA);
      }
    }
  }

  Future<bool> updateProfile(
      UserDetails userDetails, BuildContext buildContext) async {
    var hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return false;
    }

    try {
      var firebaseUser = CustomAuth.getUser();
      if (firebaseUser == null) {
        throw Exception('You are not signed in');
      } else {
        if (!userDetails.photoUrl.isValidUri()) {
          userDetails.photoUrl = '';
        }

        var updatedUserDetails = await _secureStorage.getUserDetails();
        updatedUserDetails
          ..photoUrl = userDetails.photoUrl
          ..firstName = userDetails.firstName
          ..lastName = userDetails.lastName
          ..title = userDetails.title
          ..preferences = userDetails.preferences
          ..device = userDetails.device
          ..userId = firebaseUser.uid
          ..phoneNumber = CustomAuth.getUser()?.phoneNumber ?? ''
          ..emailAddress = CustomAuth.getUser()?.email ?? '';

        await Future.wait([
          CustomAuth.updateUserProfile(userDetails),
          _secureStorage.updateUserDetails(userDetails)
        ]);

        var fields = {
          'title': userDetails.title,
          'firstName': userDetails.firstName,
          'lastName': userDetails.lastName,
          'photoUrl': userDetails.photoUrl,
          'emailAddress': userDetails.emailAddress,
          'phoneNumber': userDetails.phoneNumber,
        };

        await CloudStore.updateProfileFields(firebaseUser.uid, fields);
        return true;
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
      return false;
    }
  }

  Future<void> _logFavPlaces() async {
    var favPlaces = await _dbHelper.getFavouritePlaces();
    if (favPlaces.length >= 5) {
      await logEvent(AnalyticsEvent.savesFiveFavorites);
    }
  }

  Future<void> _logGender(UserDetails userDetails) async {
    if (userDetails.getGender() == Gender.male) {
      await logEvent(AnalyticsEvent.maleUser);
    } else if (userDetails.getGender() == Gender.female) {
      await logEvent(AnalyticsEvent.femaleUser);
    } else {
      await logEvent(AnalyticsEvent.undefinedGender);
    }
  }

  Future<void> _logNetworkProvider(UserDetails userDetails) async {
    var carrier = await _apiClient.getCarrier(userDetails.phoneNumber);
    if (carrier.toLowerCase().contains('airtel')) {
      await logEvent(AnalyticsEvent.airtelUser);
    } else if (carrier.toLowerCase().contains('mtn')) {
      await logEvent(AnalyticsEvent.mtnUser);
    } else {
      await logEvent(AnalyticsEvent.otherNetwork);
    }
  }

  Future<void> _logPlatformType() async {
    if (Platform.isAndroid) {
      await logEvent(AnalyticsEvent.androidUser);
    } else if (Platform.isIOS) {
      await logEvent(AnalyticsEvent.iosUser);
    } else {
      debugPrint('Unknown Platform');
    }
  }

  /// TODO utilise this method
  Future<void> updateCredentials(
      String? phone, String? email, BuildContext buildContext) async {
    var hasConnection =
        await checkNetworkConnection(buildContext, notifyUser: true);
    if (!hasConnection) {
      return;
    }

    try {
      var id = CustomAuth.getUserId();
      if (phone != null) {
        await CloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await _secureStorage.updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await CloudStore.updateProfileFields(id, {'emailAddress': email});
        await _secureStorage.updateUserDetailsField('emailAddress', email);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }
}
