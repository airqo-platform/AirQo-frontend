import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../models/enum_constants.dart';
import '../models/insights.dart';
import '../models/kya.dart';
import '../utils/exception.dart';
import 'native_api.dart';

class AppService {
  final DBHelper _dbHelper = DBHelper();
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();
  final SecureStorage _secureStorage = SecureStorage();
  final AirqoApiClient _apiClient = AirqoApiClient();
  final CloudAnalytics _cloudAnalytics = CloudAnalytics();
  final LocationService _locationService = LocationService();
  final RateService _rateService = RateService();
  final ShareService _shareService = ShareService();
  final NotificationService _notificationService = NotificationService();
  final SearchApi _searchApi = SearchApi();

  AirqoApiClient get apiClient => _apiClient;

  CloudStore get cloudStore => _cloudStore;

  CustomAuth get customAuth => _customAuth;

  DBHelper get dbHelper => _dbHelper;

  LocationService get locationService => _locationService;

  NotificationService get notificationService => _notificationService;

  SharedPreferencesHelper get preferencesHelper => _preferencesHelper;

  RateService get rateService => _rateService;

  SearchApi get searchApi => _searchApi;

  SecureStorage get secureStorage => _secureStorage;

  ShareService get shareService => _shareService;

  Future<bool> authenticateUser({
    required AuthMethod authMethod,
    required AuthProcedure authProcedure,
    required BuildContext buildContext,
    String? emailAddress,
    String? emailAuthLink,
    AuthCredential? authCredential,
  }) async {
    var hasConnection = await isConnected(buildContext);
    if (!hasConnection) {
      return false;
    }

    bool authSuccessful;
    if (authMethod == AuthMethod.email &&
        emailAddress != null &&
        emailAuthLink != null) {
      authSuccessful = await _customAuth.emailAuthentication(
          emailAddress, emailAuthLink, buildContext);
    } else if (authMethod == AuthMethod.phone && authCredential != null) {
      authSuccessful = await _customAuth.phoneNumberAuthentication(
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
    var currentUser = _customAuth.getUser();
    var hasConnection = await isConnected(buildContext);
    if (currentUser == null || !hasConnection) {
      ///TODO
      /// notify user
      /// Add more implementation
      return false;
    }

    try {
      var id = currentUser.uid;
      await _secureStorage.clearUserDetails();
      await _preferencesHelper.clearPreferences();
      await _cloudStore.deleteAccount(id);
      await _dbHelper.clearAccount().then((value) => {
            Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                .reloadFavouritePlaces(),
            Provider.of<NotificationModel>(buildContext, listen: false)
                .loadNotifications()
          });

      await currentUser.delete();
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
        var methods = await _customAuth.firebaseAuth
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
      isConnected(buildContext),
      fetchLatestMeasurements(),
      fetchKya(),
      loadNotifications(buildContext),
      loadFavPlaces(buildContext),
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
      await fetchInsights(placeIds);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<List<Insights>> fetchInsights(List<String> siteIds,
      {Frequency? frequency}) async {
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

    await dbHelper.insertInsights(insights, siteIds);

    if (frequency != null) {
      var frequencyInsights = <Insights>[];
      frequencyInsights = insights
          .where((element) => element.frequency == frequency.getName())
          .toList();
      return frequencyInsights;
    }

    return insights;
  }

  Future<void> fetchKya() async {
    try {
      var kyas = await _cloudStore.getKya(_customAuth.getUserId());
      await _dbHelper.insertKyas(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> fetchLatestMeasurements() async {
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

  Future<bool> isConnected(BuildContext buildContext) async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
    } catch (_) {}

    await showSnackBar(buildContext, Config.connectionErrorMessage);
    return false;
  }

  bool isLoggedIn() {
    return _customAuth.isLoggedIn();
  }

  Future<void> loadFavPlaces(BuildContext buildContext) async {
    try {
      var _offlineFavPlaces = await _dbHelper.getFavouritePlaces();
      var _cloudFavPlaces =
          await _cloudStore.getFavPlaces(_customAuth.getUserId());

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
        _cloudStore.updateFavPlaces(_customAuth.getUserId(), favPlaces)
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> loadNotifications(BuildContext buildContext) async {
    // TODO IMPLEMENT GET NOTIFICATIONS
    await Provider.of<NotificationModel>(buildContext, listen: false)
        .loadNotifications();
  }

  Future<void> logEvent(AnalyticsEvent analyticsEvent) async {
    var loggedIn = isLoggedIn();
    await _cloudAnalytics.logEvent(analyticsEvent, loggedIn);
  }

  Future<bool> logOut(buildContext) async {
    var hasConnection = await isConnected(buildContext);
    if (!hasConnection) {
      await showSnackBar(buildContext, Config.connectionErrorMessage);
      return false;
    }

    try {
      var userId = _customAuth.getUserId();
      var favPlaces = await _dbHelper.getFavouritePlaces();
      await _cloudStore.updateProfileFields(userId, {'device': ''});
      await _cloudStore.updateFavPlaces(userId, favPlaces);
      await _secureStorage.clearUserDetails();
      await _preferencesHelper.clearPreferences();
      await _dbHelper.clearAccount().then((value) => {
            Provider.of<NotificationModel>(buildContext, listen: false)
                .loadNotifications(),
            Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                .reloadFavouritePlaces()
          });
      await _customAuth.logOut(buildContext);
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
    return true;
  }

  Future<void> postLoginActions(BuildContext buildContext) async {
    try {
      var user = _customAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection = await isConnected(buildContext);
      if (!hasConnection) {
        await showSnackBar(buildContext, Config.connectionErrorMessage);
        return;
      }

      var userDetails = await _cloudStore.getProfile(user.uid);
      userDetails ??= await _customAuth.createProfile();

      if (userDetails == null) {
        return;
      }

      var device = await _firebaseMessaging.getToken();
      if (device != null) {
        await _cloudStore.updateProfileFields(user.uid, {'device': device});
      }

      await Future.wait([
        _secureStorage.updateUserDetails(userDetails),
        _preferencesHelper.updatePreferences(userDetails.preferences),
        _cloudStore.getFavPlaces(user.uid).then((value) => {
              if (value.isNotEmpty)
                {
                  _dbHelper.setFavouritePlaces(value),
                  Provider.of<PlaceDetailsModel>(buildContext, listen: false)
                      .reloadFavouritePlaces(),
                }
            }),
        _cloudStore.getNotifications(user.uid).then((value) => {
              if (value.isNotEmpty)
                {
                  Provider.of<NotificationModel>(buildContext, listen: false)
                      .addAll(value),
                }
            }),
        _logPlatformType(),
        updateFavouritePlacesSites(buildContext)
      ]);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> postSignUpActions(BuildContext buildContext) async {
    try {
      var user = _customAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection = await isConnected(buildContext);
      if (!hasConnection) {
        await showSnackBar(buildContext, Config.connectionErrorMessage);
        return;
      }

      var userDetails = await _customAuth.createProfile();

      if (userDetails == null) {
        return;
      }

      var device = await _firebaseMessaging.getToken();
      if (device != null) {
        userDetails.device = device;
      }

      await Future.wait([
        _cloudStore.updateProfile(userDetails, user.uid),
        _secureStorage.updateUserDetails(userDetails),
        _preferencesHelper.updatePreferences(userDetails.preferences),
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
      fetchLatestMeasurements(),
      fetchKya(),
      loadNotifications(buildContext),
      updateFavouritePlacesSites(buildContext),
    ]);
  }

  Future<void> refreshAnalytics() async {
    await Future.wait([
      fetchLatestMeasurements(),
      fetchKya(),
      fetchFavPlacesInsights(),
    ]);
  }

  Future<void> updateFavouritePlace(
      PlaceDetails placeDetails, BuildContext context) async {
    var isFav = await _dbHelper.updateFavouritePlace(placeDetails);
    if (isFav) {
      await _cloudStore.addFavPlace(_customAuth.getUserId(), placeDetails);
    } else {
      await _cloudStore.removeFavPlace(_customAuth.getUserId(), placeDetails);
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
      var nearestSite = await _locationService.getNearestSite(
          favPlace.latitude, favPlace.longitude);
      if (nearestSite != null) {
        favPlace.siteId = nearestSite.id;
      }
      updatedFavPlaces.add(favPlace);
    }
    await _dbHelper
        .updateFavouritePlacesDetails(updatedFavPlaces)
        .then((value) => loadFavPlaces(buildContext));
  }

  Future<void> updateKya(Kya kya, BuildContext buildContext) async {
    await _dbHelper.updateKya(kya);
    var connected = await isConnected(buildContext);
    if (_customAuth.isLoggedIn() && connected) {
      await _cloudStore.updateKyaProgress(_customAuth.getUserId(), kya);
      if (kya.progress == kya.lessons.length) {
        await logEvent(AnalyticsEvent.completeOneKYA);
      }
    }
  }

  Future<bool> updateProfile(
      UserDetails userDetails, BuildContext buildContext) async {
    var hasConnection = await isConnected(buildContext);
    if (!hasConnection) {
      return false;
    }

    try {
      var firebaseUser = _customAuth.getUser();
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
          ..phoneNumber = _customAuth.getUser()?.phoneNumber ?? ''
          ..emailAddress = _customAuth.getUser()?.email ?? '';

        await _customAuth.updateUserProfile(userDetails);
        await _secureStorage.updateUserDetails(userDetails);

        var fields = {
          'title': userDetails.title,
          'firstName': userDetails.firstName,
          'lastName': userDetails.lastName,
          'photoUrl': userDetails.photoUrl,
          'emailAddress': userDetails.emailAddress,
          'phoneNumber': userDetails.phoneNumber,
        };

        await _cloudStore.updateProfileFields(firebaseUser.uid, fields);
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
  Future<void> _updateCredentials(
      String? phone, String? email, BuildContext buildContext) async {
    var hasConnection = await isConnected(buildContext);
    if (!hasConnection) {
      return;
    }

    try {
      var id = _customAuth.getUserId();
      if (phone != null) {
        await _cloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await _secureStorage.updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await _cloudStore.updateProfileFields(id, {'emailAddress': email});
        await _secureStorage.updateUserDetailsField('emailAddress', email);
      }
    } catch (exception, stackTrace) {
      await logException(exception, stackTrace);
    }
  }
}
