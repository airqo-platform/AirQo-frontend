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
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class AppService {
  final DBHelper _dbHelper = DBHelper();
  final BuildContext _context;
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();
  final SecureStorage _secureStorage = SecureStorage();
  late AirqoApiClient _apiClient;

  AppService(this._context) {
    _apiClient = AirqoApiClient(_context);
  }

  AirqoApiClient get apiClient => _apiClient;

  CloudStore get cloudStore => _cloudStore;

  CustomAuth get customAuth => _customAuth;

  DBHelper get dbHelper => _dbHelper;

  SharedPreferencesHelper get preferencesHelper => _preferencesHelper;

  SecureStorage get secureStorage => _secureStorage;

  Future<bool> authenticateUser(
      AuthCredential? authCredential,
      String emailAddress,
      String emailAuthLink,
      authMethod method,
      authProcedure procedure) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    bool authSuccessful;
    if (method == authMethod.email) {
      authSuccessful = await _customAuth.emailAuthentication(
          emailAddress, emailAuthLink, _context);
    } else if (method == authMethod.phone && authCredential != null) {
      authSuccessful =
          await _customAuth.phoneNumberAuthentication(authCredential, _context);
    } else {
      authSuccessful = false;
    }

    if (authSuccessful) {
      if (procedure == authProcedure.signup) {
        await postSignUpActions();
      } else {
        await postLoginActions();
      }
    }

    return authSuccessful;
  }

  Future<bool> deleteAccount() async {
    var currentUser = _customAuth.getUser();
    var hasConnection = await isConnected();
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
            Provider.of<PlaceDetailsModel>(_context, listen: false)
                .reloadFavouritePlaces(),
            Provider.of<NotificationModel>(_context, listen: false)
                .loadNotifications()
          });

      await currentUser.delete();
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      return false;
    }
    return true;
  }

  Future<bool> doesUserExist(String phoneNumber, String emailAddress) async {
    try {
      if (emailAddress.isNotEmpty) {
        var methods = await _customAuth.firebaseAuth
            .fetchSignInMethodsForEmail(emailAddress);
        return methods.isNotEmpty;
      }
      return _apiClient.checkIfUserExists(phoneNumber, emailAddress);
    } catch (exception, stackTrace) {
      debugPrint('$exception \n $stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
      await showSnackBar(_context, 'Failed to perform action. Try again later');
      return true;
    }
  }

  Future<void> fetchData() async {
    await Future.wait([
      fetchLatestMeasurements(),
      _fetchKya(),
      loadNotifications(),
      loadFavPlaces(),
      fetchFavPlacesInsights(),
    ]);
  }

  Future<void> fetchFavPlacesInsights() async {
    try {
      var favPlaces = await _dbHelper.getFavouritePlaces();

      if (favPlaces.isEmpty) {
        return;
      }

      var placeIds = '';

      for (var favPlace in favPlaces) {
        if (placeIds.isEmpty) {
          placeIds = favPlace.siteId;
        } else {
          placeIds = '$placeIds,${favPlace.siteId}';
        }
      }

      var placesInsights = await _apiClient.fetchSitesInsights(placeIds);

      while (placesInsights.isNotEmpty) {
        var siteInsight = placesInsights.first;

        var filteredInsights = placesInsights
            .where((element) =>
                (element.siteId == siteInsight.siteId) &&
                (element.frequency == siteInsight.frequency))
            .toList();

        await _dbHelper.insertInsights(
            filteredInsights, siteInsight.siteId, siteInsight.frequency);

        placesInsights.removeWhere((element) =>
            (element.siteId == siteInsight.siteId) &&
            (element.frequency == siteInsight.frequency));
      }
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

  Future<bool> isConnected() async {
    try {
      final result = await InternetAddress.lookup('firebase.google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true;
      }
      return false;
    } catch (_) {}

    return false;
  }

  bool isLoggedIn() {
    return _customAuth.isLoggedIn();
  }

  Future<void> loadFavPlaces() async {
    try {
      var _offlineFavPlaces = await _dbHelper.getFavouritePlaces();
      var _cloudFavPlaces =
          await _cloudStore.getFavPlaces(_customAuth.getUserId());

      for (var place in _offlineFavPlaces) {
        _cloudFavPlaces.removeWhere(
            (element) => element.placeId.equalsIgnoreCase(place.placeId));
      }

      var favPlaces = [..._offlineFavPlaces, ..._cloudFavPlaces];

      await _dbHelper.setFavouritePlaces(favPlaces).then((value) => {
            Provider.of<PlaceDetailsModel>(_context, listen: false)
                .reloadFavouritePlaces(),
          });

      await _cloudStore.updateFavPlaces(_customAuth.getUserId(), favPlaces);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> loadNotifications() async {
    // TODO IMPLEMENT GET NOTIFICATIONS
    await Provider.of<NotificationModel>(_context, listen: false)
        .loadNotifications();
  }

  Future<bool> logOut(context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      await showSnackBar(_context, Config.connectionErrorMessage);
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
            Provider.of<NotificationModel>(context, listen: false)
                .loadNotifications(),
            Provider.of<PlaceDetailsModel>(context, listen: false)
                .reloadFavouritePlaces()
          });
      await _customAuth.logOut(_context);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return true;
  }

  Future<void> postLoginActions() async {
    try {
      var user = _customAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection = await isConnected();
      if (!hasConnection) {
        await showSnackBar(_context, Config.connectionErrorMessage);
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

      await _secureStorage.updateUserDetails(userDetails);
      await _preferencesHelper.updatePreferences(userDetails.preferences);
      await _cloudStore.getFavPlaces(user.uid).then((value) => {
            if (value.isNotEmpty)
              {
                _dbHelper.setFavouritePlaces(value),
                Provider.of<PlaceDetailsModel>(_context, listen: false)
                    .reloadFavouritePlaces(),
              }
          });
      await _cloudStore.getNotifications(user.uid).then((value) => {
            if (value.isNotEmpty)
              {
                Provider.of<NotificationModel>(_context, listen: false)
                    .addAll(value),
              }
          });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> postSignUpActions() async {
    try {
      var user = _customAuth.getUser();
      if (user == null) {
        return;
      }

      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );

      var hasConnection = await isConnected();
      if (!hasConnection) {
        await showSnackBar(_context, Config.connectionErrorMessage);
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

      await _cloudStore.updateProfile(userDetails, user.uid);
      await _secureStorage.updateUserDetails(userDetails);
      await _preferencesHelper.updatePreferences(userDetails.preferences);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> reloadData() async {
    await Future.wait([
      fetchLatestMeasurements(),
      _fetchKya(),
      fetchFavPlacesInsights(),
    ]);
  }

  Future<void> updateFavouritePlace(PlaceDetails placeDetails) async {
    var isFav = await _dbHelper.updateFavouritePlace(placeDetails);
    if (isFav) {
      await _cloudStore.addFavPlace(_customAuth.getUserId(), placeDetails);
    } else {
      await _cloudStore.removeFavPlace(_customAuth.getUserId(), placeDetails);
    }

    await Provider.of<PlaceDetailsModel>(_context, listen: false)
        .reloadFavouritePlaces();
  }

  Future<void> updateProfile(UserDetails userDetails) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
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
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> _fetchKya() async {
    try {
      var kyas = await _cloudStore.getKya(_customAuth.getUserId());
      await _dbHelper.insertKyas(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  /// TODO utilise this method
  Future<void> _updateCredentials(String? phone, String? email) async {
    var hasConnection = await isConnected();
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
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}

enum authMethod { phone, email }

enum authProcedure { login, signup }
