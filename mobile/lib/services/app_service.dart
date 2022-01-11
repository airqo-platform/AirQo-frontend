import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/notification.dart';
import 'package:app/models/place_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/dialogs.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class AppService {
  final DBHelper _dbHelper = DBHelper();
  final BuildContext _buildContext;
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper _preferencesHelper = SharedPreferencesHelper();
  final SecureStorage _secureStorage = SecureStorage();
  AirqoApiClient? _apiClient;

  AppService(this._buildContext) {
    _apiClient = AirqoApiClient(_buildContext);
  }

  void fetchData() {
    _fetchLatestMeasurements();
    _fetchKya();
    _fetchNotifications();
    _fetchFavPlaces();
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

  Future<bool> login(AuthCredential? authCredential, String emailAddress,
      String emailAuthLink, authMethod method) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    if (method == authMethod.email) {
      _customAuth.logInWithEmailAddress(emailAddress, emailAuthLink);
    } else if (method == authMethod.phone && authCredential != null) {
      _customAuth.logInWithPhoneNumber(authCredential);
    }

    await postLoginActions();
    return _customAuth.isLoggedIn();
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
        await showSnackBar(_buildContext, Config.connectionErrorMessage);
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
                Provider.of<PlaceDetailsModel>(_buildContext, listen: false)
                    .loadFavouritePlaces(value),
              }
          });
      await _cloudStore.getNotifications(user.uid).then((value) => {
            if (value.isNotEmpty)
              {
                Provider.of<NotificationModel>(_buildContext, listen: false)
                    .addAll(value),
              }
          });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> updateFavouritePlace(PlaceDetails placeDetails) async {
    var isFav = await _dbHelper.updateFavouritePlace(placeDetails);
    if (isFav) {
      await _cloudStore.addFavPlace(_customAuth.getId(), placeDetails);
    } else {
      await _cloudStore.removeFavPlace(_customAuth.getId(), placeDetails);
    }

    await Provider.of<PlaceDetailsModel>(_buildContext, listen: false)
        .reloadFavouritePlaces();
  }

  Future<void> _fetchFavPlaces() async {
    // TODO IMPLEMENT GET FAVOURITE PLACES
  }

  Future<void> _fetchKya() async {
    try {
      var kyas = await _cloudStore.getKya(_customAuth.getId());
      await _dbHelper.insertKyas(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _fetchLatestMeasurements() async {
    try {
      await _apiClient!.fetchLatestMeasurements().then((value) => {
            if (value.isNotEmpty) {_dbHelper.insertLatestMeasurements(value)}
          });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _fetchNotifications() async {
    // TODO IMPLEMENT GET NOTIFICATIONS
  }

  Future<void> _updateCredentials(String? phone, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var id = _customAuth.getId();
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
