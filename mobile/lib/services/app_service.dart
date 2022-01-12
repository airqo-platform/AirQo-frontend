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
  final DBHelper dbHelper = DBHelper();
  final BuildContext _context;
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth customAuth = CustomAuth();
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final SharedPreferencesHelper preferencesHelper = SharedPreferencesHelper();
  final SecureStorage secureStorage = SecureStorage();
  late AirqoApiClient apiClient;

  AppService(this._context) {
    apiClient = AirqoApiClient(_context);
  }

  Future<bool> deleteAccount() async {
    var currentUser = customAuth.getUser();
    var hasConnection = await isConnected();
    if (currentUser == null || !hasConnection) {
      ///TODO
      /// notify user
      return false;
    }

    try {
      var id = currentUser.uid;
      await secureStorage.clearUserDetails();
      await preferencesHelper.clearPreferences();
      await _cloudStore.deleteAccount(id);
      await dbHelper.clearAccount().then((value) => {
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

  void fetchData() {
    _fetchLatestMeasurements();
    _fetchKya();
    loadNotifications();
    loadFavPlaces();
  }

  Future<UserDetails> getUserDetails() async {
    var userDetails = await secureStorage.getUserDetails();
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
    return customAuth.isLoggedIn();
  }

  Future<void> loadFavPlaces() async {
    try {
      var _offlineFavPlaces = await dbHelper.getFavouritePlaces();
      var _cloudFavPlaces =
          await _cloudStore.getFavPlaces(customAuth.getUserId());

      for (var place in _offlineFavPlaces) {
        _cloudFavPlaces.removeWhere(
            (element) => element.placeId.equalsIgnoreCase(place.placeId));
      }

      var favPlaces = [..._offlineFavPlaces, ..._cloudFavPlaces];

      await dbHelper.setFavouritePlaces(favPlaces).then((value) => {
            Provider.of<PlaceDetailsModel>(_context, listen: false)
                .reloadFavouritePlaces(),
          });

      await _cloudStore.updateFavPlaces(customAuth.getUserId(), favPlaces);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> loadNotifications() async {
    // TODO IMPLEMENT GET NOTIFICATIONS
    await Provider.of<NotificationModel>(_context, listen: false)
        .loadNotifications();
  }

  Future<bool> login(AuthCredential? authCredential, String emailAddress,
      String emailAuthLink, authMethod method) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    if (method == authMethod.email) {
      customAuth.logInWithEmailAddress(emailAddress, emailAuthLink);
    } else if (method == authMethod.phone && authCredential != null) {
      customAuth.logInWithPhoneNumber(authCredential);
    }

    postLoginActions();
    return customAuth.isLoggedIn();
  }

  Future<void> logOut(context) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var userId = customAuth.getUserId();
      await _cloudStore.updateProfileFields(userId, {'device': ''});
      await secureStorage.clearUserDetails();
      await preferencesHelper.clearPreferences();
      await dbHelper.clearAccount().then((value) => {
            Provider.of<NotificationModel>(context, listen: false)
                .loadNotifications(),
            Provider.of<PlaceDetailsModel>(context, listen: false)
                .reloadFavouritePlaces()
          });
      await customAuth.logOut(_context);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  void postLoginActions() async {
    try {
      var user = customAuth.getUser();
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
      userDetails ??= await customAuth.createProfile();

      if (userDetails == null) {
        return;
      }

      var device = await _firebaseMessaging.getToken();
      if (device != null) {
        await _cloudStore.updateProfileFields(user.uid, {'device': device});
      }

      await secureStorage.updateUserDetails(userDetails);
      await preferencesHelper.updatePreferences(userDetails.preferences);
      await _cloudStore.getFavPlaces(user.uid).then((value) => {
            if (value.isNotEmpty)
              {
                dbHelper.setFavouritePlaces(value),
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

  void postSignUpActions() async {
    try {
      var user = customAuth.getUser();
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

      var userDetails = await customAuth.createProfile();

      if (userDetails == null) {
        return;
      }

      var device = await _firebaseMessaging.getToken();
      if (device != null) {
        userDetails.device = device;
      }

      await _cloudStore.updateProfile(userDetails, user.uid);
      await secureStorage.updateUserDetails(userDetails);
      await preferencesHelper.updatePreferences(userDetails.preferences);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<bool> signup(AuthCredential? authCredential, String emailAddress,
      String emailAuthLink, authMethod method) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return false;
    }

    if (method == authMethod.email) {
      await customAuth
          .signUpWithEmailAddress(emailAddress, emailAuthLink)
          .then((value) => {postSignUpActions()});
    } else if (method == authMethod.phone && authCredential != null) {
      await customAuth
          .signUpWithPhoneNumber(authCredential)
          .then((value) => {postSignUpActions()});
    }

    return customAuth.isLoggedIn();
  }

  Future<void> updateFavouritePlace(PlaceDetails placeDetails) async {
    var isFav = await dbHelper.updateFavouritePlace(placeDetails);
    if (isFav) {
      await _cloudStore.addFavPlace(customAuth.getUserId(), placeDetails);
    } else {
      await _cloudStore.removeFavPlace(customAuth.getUserId(), placeDetails);
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
      var firebaseUser = customAuth.getUser();
      if (firebaseUser == null) {
        throw Exception('You are not signed in');
      } else {
        if (!userDetails.photoUrl.isValidUri()) {
          userDetails.photoUrl = '';
        }

        var updatedUserDetails = await secureStorage.getUserDetails();
        updatedUserDetails
          ..photoUrl = userDetails.photoUrl
          ..firstName = userDetails.firstName
          ..lastName = userDetails.lastName
          ..title = userDetails.title
          ..preferences = userDetails.preferences
          ..device = userDetails.device
          ..userId = firebaseUser.uid
          ..phoneNumber = customAuth.getUser()?.phoneNumber ?? ''
          ..emailAddress = customAuth.getUser()?.email ?? '';

        await customAuth.updateUserProfile(userDetails);
        await secureStorage.updateUserDetails(userDetails);

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
      var kyas = await _cloudStore.getKya(customAuth.getUserId());
      await dbHelper.insertKyas(kyas);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _fetchLatestMeasurements() async {
    try {
      await apiClient.fetchLatestMeasurements().then((value) => {
            if (value.isNotEmpty) {dbHelper.insertLatestMeasurements(value)}
          });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }

  Future<void> _updateCredentials(String? phone, String? email) async {
    var hasConnection = await isConnected();
    if (!hasConnection) {
      return;
    }

    try {
      var id = customAuth.getUserId();
      if (phone != null) {
        await _cloudStore.updateProfileFields(id, {'phoneNumber': phone});
        await secureStorage.updateUserDetailsField('phoneNumber', phone);
      }
      if (email != null) {
        await _cloudStore.updateProfileFields(id, {'emailAddress': email});
        await secureStorage.updateUserDetailsField('emailAddress', email);
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
