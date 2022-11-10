import 'dart:io';

import 'package:app/blocs/blocs.dart';
import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart' as firebase_storage;
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';

class CloudAnalytics {
  static Future<bool> logEvent(AnalyticsEvent analyticsEvent) async {
    await FirebaseAnalytics.instance.logEvent(
      name: analyticsEvent.snakeCase(),
    );

    return true;
  }

  static Future<void> logNetworkProvider() async {
    final profile = Hive.box<Profile>(HiveBox.profile).getAt(0);
    if (profile != null) {
      final carrier = await AirqoApiClient().getCarrier(profile.phoneNumber);
      if (carrier.toLowerCase().contains('airtel')) {
        await logEvent(AnalyticsEvent.airtelUser);
      } else if (carrier.toLowerCase().contains('mtn')) {
        await logEvent(AnalyticsEvent.mtnUser);
      } else {
        await logEvent(
          AnalyticsEvent.otherNetwork,
        );
      }
    }
  }

  static Future<void> logPlatformType() async {
    if (Platform.isAndroid) {
      await logEvent(
        AnalyticsEvent.androidUser,
      );
    } else if (Platform.isIOS) {
      await logEvent(
        AnalyticsEvent.iosUser,
      );
    } else {
      debugPrint('Unknown Platform');
    }
  }

  static Future<void> logGender() async {
    final profile = Hive.box<Profile>(HiveBox.profile).getAt(0);
    if (profile != null) {
      if (profile.getGender() == Gender.male) {
        await logEvent(
          AnalyticsEvent.maleUser,
        );
      } else if (profile.getGender() == Gender.female) {
        await logEvent(
          AnalyticsEvent.femaleUser,
        );
      } else {
        await logEvent(
          AnalyticsEvent.undefinedGender,
        );
      }
    }
  }
}

class CloudStore {
  static Future<bool> deleteAccount() async {
    try {
      final id = CustomAuth.getUser()?.uid;
      await Future.wait([
        FirebaseFirestore.instance
            .collection(Config.usersCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.usersNotificationCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.favPlacesCollection)
            .doc(id)
            .delete(),
        FirebaseFirestore.instance
            .collection(Config.usersAnalyticsCollection)
            .doc(id)
            .delete(),
      ]);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return true;
  }

  static Future<List<Kya>> _getReferenceKya() async {
    final referenceKyaCollection =
        await FirebaseFirestore.instance.collection(Config.kyaCollection).get();
    final referenceKya = <Kya>[];
    for (final kyaDoc in referenceKyaCollection.docs) {
      try {
        final kyaData = kyaDoc.data();
        if (kyaData.isEmpty) {
          continue;
        }
        referenceKya.add(Kya.fromJson(kyaData));
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }

    return referenceKya;
  }

  static Future<List<Kya>> _getUserKya() async {
    final userId = CustomAuth.getUserId();
    if (userId.isEmpty) {
      return [];
    }

    final kya = <Kya>[];

    final userKyaCollection = await FirebaseFirestore.instance
        .collection(Config.usersKyaCollection)
        .doc(userId)
        .collection(userId)
        .get();

    for (final kyaDoc in userKyaCollection.docs) {
      try {
        kya.add(
          Kya.fromJson(
            kyaDoc.data(),
          ),
        );
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }

    return kya;
  }

  static Future<List<Kya>> getKya() async {
    final referenceKya = await _getReferenceKya();

    if (CustomAuth.isGuestUser()) {
      return referenceKya;
    }

    final userKya = await _getUserKya();

    final List<String> userKyaIds = userKya.map((kya) => kya.id).toList();
    referenceKya.removeWhere((kya) => userKyaIds.contains(kya.id));

    userKya.addAll(referenceKya);

    return userKya;
  }

  static Future<List<AppNotification>> getNotifications() async {
    final uid = CustomAuth.getUserId();
    if (uid.isEmpty) {
      return [];
    }

    try {
      final notificationsJson = await FirebaseFirestore.instance
          .collection('${Config.usersNotificationCollection}/$uid/$uid')
          .get();

      final notifications = <AppNotification>[];

      for (final doc in notificationsJson.docs) {
        final notification = AppNotification.parseAppNotification(
          doc.data(),
        );
        if (notification != null) {
          notifications.add(notification);
        }
      }

      return notifications;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<List<Analytics>> getCloudAnalytics() async {
    final uid = CustomAuth.getUserId();
    if (uid.isEmpty) {
      return [];
    }

    try {
      final analyticsCollection = await FirebaseFirestore.instance
          .collection('${Config.usersAnalyticsCollection}/$uid/$uid')
          .get();

      final cloudAnalytics = <Analytics>[];

      for (final doc in analyticsCollection.docs) {
        final analytics = Analytics.parseAnalytics(
          doc.data(),
        );
        if (analytics != null) {
          cloudAnalytics.add(analytics);
        }
      }

      return cloudAnalytics;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  static Future<Profile> getProfile() async {
    try {
      final uuid = CustomAuth.getUserId();

      final userJson = await FirebaseFirestore.instance
          .collection(Config.usersCollection)
          .doc(uuid)
          .get();

      return Profile.fromJson(
        userJson.data()!,
      );
    } on FirebaseException catch (exception) {
      if (exception.code == 'not-found') {
        return await CustomAuth.createProfile();
      } else {
        rethrow;
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return Profile.getProfile();
  }

  static Future<List<FavouritePlace>> getFavouritePlaces() async {
    try {
      final userId = CustomAuth.getUserId();

      if (userId.isEmpty) return [];

      final jsonObject = await FirebaseFirestore.instance
          .collection(Config.favPlacesCollection)
          .doc(userId)
          .collection(userId)
          .get();

      final favouritePlaces = <FavouritePlace>[];

      for (final doc in jsonObject.docs) {
        try {
          favouritePlaces.add(FavouritePlace.fromFirestore(snapshot: doc));
        } catch (exception, stackTrace) {
          await logException(exception, stackTrace);
        }
      }

      return favouritePlaces;
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );

      return [];
    }
  }

  static Future<bool> updateFavouritePlaces() async {
    final hasConnection = await hasNetworkConnection();
    final userId = CustomAuth.getUserId();
    if (!hasConnection || userId.trim().isEmpty) {
      return true;
    }

    final batch = FirebaseFirestore.instance.batch();

    final cloudFavPlaces = await getFavouritePlaces();
    for (final favouritePlace in cloudFavPlaces) {
      try {
        final document = FirebaseFirestore.instance
            .collection(Config.favPlacesCollection)
            .doc(userId)
            .collection(userId)
            .doc(favouritePlace.placeId);
        batch.delete(document);
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }

    final favouritePlaces =
        Hive.box<FavouritePlace>(HiveBox.favouritePlaces).values.toList();
    for (final favouritePlace in favouritePlaces) {
      try {
        final document = FirebaseFirestore.instance
            .collection(Config.favPlacesCollection)
            .doc(userId)
            .collection(userId)
            .doc(favouritePlace.placeId);
        batch.set(
          document,
          favouritePlace.toJson(),
        );
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }

    batch.commit();

    return true;
  }

  static Future<void> updateProfile(Profile profile) async {
    final currentUser = CustomAuth.getUser();
    if (currentUser == null || CustomAuth.isGuestUser()) {
      return;
    }
    try {
      try {
        await Future.wait([
          currentUser.updateDisplayName(profile.firstName),
          FirebaseFirestore.instance
              .collection(Config.usersCollection)
              .doc(profile.userId)
              .update(
                profile.toJson(),
              ),
        ]);
      } catch (exception) {
        await Future.wait([
          currentUser.updateDisplayName(profile.firstName),
          FirebaseFirestore.instance
              .collection(Config.usersCollection)
              .doc(profile.userId)
              .set(
                profile.toJson(),
              ),
        ]);
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<bool> updateCloudAnalytics() async {
    final currentUser = CustomAuth.getUser();
    if (currentUser == null) {
      return true;
    }
    try {
      final analytics = Hive.box<Analytics>(HiveBox.analytics)
          .values
          .toList()
          .cast<Analytics>();
      final profile = await Profile.getProfile();
      for (final x in analytics) {
        try {
          await FirebaseFirestore.instance
              .collection(Config.usersAnalyticsCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(x.site)
              .set(
                x.toJson(),
              );
        } catch (exception) {
          debugPrint(exception.toString());
        }
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return true;
  }

  static Future<void> updateCloudNotification(
    AppNotification notification,
  ) async {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        final profile = await Profile.getProfile();
        try {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .update(
                notification.toJson(),
              );
        } catch (exception) {
          await FirebaseFirestore.instance
              .collection(Config.usersNotificationCollection)
              .doc(profile.userId)
              .collection(profile.userId)
              .doc(notification.id)
              .set(
                notification.toJson(),
              );
        }
      } catch (exception, stackTrace) {
        await logException(
          exception,
          stackTrace,
        );
      }
    }
  }

  static Future<void> updateKya(Kya kya) async {
    if (CustomAuth.isGuestUser()) {
      return;
    }

    final userId = CustomAuth.getUserId();

    try {
      await FirebaseFirestore.instance
          .collection(Config.usersKyaCollection)
          .doc(userId)
          .collection(userId)
          .doc(kya.id)
          .update(
            kya.toJson(),
          );
    } on FirebaseException catch (exception, stackTrace) {
      // TODO : Add to authentication decryption enum
      if (exception.code.contains('not-found')) {
        await FirebaseFirestore.instance
            .collection(Config.usersKyaCollection)
            .doc(userId)
            .collection(userId)
            .doc(kya.id)
            .set(
              kya.toJson(),
            );
      } else {
        await logException(
          exception,
          stackTrace,
        );
      }
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<String> uploadProfilePicture(String filePath) async {
    try {
      final userId = CustomAuth.getUserId();
      final file = File(filePath);

      final docRef = '${Config.usersProfilePictureStorage}/'
          '$userId/avatar${file.getExtension()}';

      final task = await firebase_storage.FirebaseStorage.instance
          .ref(docRef)
          .putFile(file);

      return await task.storage.ref(docRef).getDownloadURL();
    } on Exception catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return '';
  }
}

class CloudMessaging {
  static Future<String?> getDeviceToken() async {
    return await FirebaseMessaging.instance.getToken();
  }
}

class CustomAuth {
  static Future<Profile> createProfile() async {
    final profile = await Profile.getProfile();
    try {
      await FirebaseAuth.instance.currentUser
          ?.updateDisplayName(profile.firstName);
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return profile;
  }

  static Future<bool> deleteAccount() async {
    final profile = await Profile.getProfile();
    await getUser()?.delete().then((_) => profile.deleteAccount());

    return true;
  }

  static Future<bool> firebaseSignIn(
    AuthCredential? authCredential,
  ) async {
    final UserCredential userCredential = authCredential == null
        ? await FirebaseAuth.instance.signInAnonymously()
        : await FirebaseAuth.instance.signInWithCredential(authCredential);

    return userCredential.user != null;
  }

  static User? getUser() {
    return FirebaseAuth.instance.currentUser;
  }

  static String getUserId() {
    if (!isLoggedIn()) {
      return '';
    }

    return getUser()!.uid;
  }

  static bool isLoggedIn() {
    final user = getUser();
    if (user == null) {
      return false;
    }

    return !user.isAnonymous;
  }

  static bool isGuestUser() {
    final user = getUser();
    if (user == null) {
      return true;
    }

    return user.isAnonymous;
  }

  static Future<bool> logOut() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return true;
  }

  static Future<bool> reAuthenticate(AuthCredential authCredential) async {
    final userCredential = await FirebaseAuth.instance.currentUser!
        .reauthenticateWithCredential(authCredential);

    return userCredential.user != null;
  }

  static AuthenticationError getFirebaseErrorCodeMessage(String code) {
    switch (code) {
      case 'invalid-email':
        return AuthenticationError.invalidEmailAddress;
      case 'email-already-in-use':
        return AuthenticationError.emailTaken;
      case 'credential-already-in-use':
      case 'account-exists-with-different-credential':
        return AuthenticationError.accountTaken;
      case 'invalid-verification-code':
        return AuthenticationError.invalidAuthCode;
      case 'invalid-phone-number':
        return AuthenticationError.invalidPhoneNumber;
      case 'session-expired':
      case 'expired-action-code':
        return AuthenticationError.authSessionTimeout;
      case 'user-disabled':
      case 'user-mismatch':
      case 'user-not-found':
        return AuthenticationError.accountInvalid;
      case 'requires-recent-login':
        return AuthenticationError.logInRequired;
      case 'invalid-verification-id':
      case 'invalid-credential':
      case 'missing-client-identifier':
      default:
        return AuthenticationError.authFailure;
    }
  }

  static Future<void> sendPhoneAuthCode({
    required String phoneNumber,
    required BuildContext buildContext,
    required AuthProcedure authProcedure,
  }) async {
    await FirebaseAuth.instance.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) {
        switch (authProcedure) {
          case AuthProcedure.login:
          case AuthProcedure.signup:
            buildContext
                .read<PhoneAuthBloc>()
                .add(const UpdateStatus(BlocStatus.success));
            break;
          case AuthProcedure.deleteAccount:
            buildContext
                .read<AccountBloc>()
                .add(const AccountDeletionCheck(passed: true));
            break;
          case AuthProcedure.anonymousLogin:
          case AuthProcedure.logout:
          case AuthProcedure.none:
            break;
        }

        buildContext
            .read<AuthCodeBloc>()
            .add(VerifyAuthCode(credential: credential));
      },
      verificationFailed: (FirebaseAuthException exception) async {
        throw exception;
      },
      codeSent: (String verificationId, int? resendToken) async {
        buildContext
            .read<AuthCodeBloc>()
            .add(UpdateVerificationId(verificationId));

        switch (authProcedure) {
          case AuthProcedure.login:
          case AuthProcedure.signup:
            buildContext
                .read<PhoneAuthBloc>()
                .add(const UpdateStatus(BlocStatus.success));
            break;
          case AuthProcedure.deleteAccount:
            buildContext
                .read<AccountBloc>()
                .add(const AccountDeletionCheck(passed: true));
            break;
          case AuthProcedure.anonymousLogin:
          case AuthProcedure.logout:
          case AuthProcedure.none:
            break;
        }
      },
      codeAutoRetrievalTimeout: (String verificationId) async {
        buildContext
            .read<AuthCodeBloc>()
            .add(UpdateVerificationId(verificationId));

        switch (authProcedure) {
          case AuthProcedure.login:
          case AuthProcedure.signup:
            buildContext
                .read<PhoneAuthBloc>()
                .add(const UpdateStatus(BlocStatus.success));
            break;
          case AuthProcedure.deleteAccount:
            buildContext
                .read<AccountBloc>()
                .add(const AccountDeletionCheck(passed: true));
            break;
          case AuthProcedure.anonymousLogin:
          case AuthProcedure.logout:
          case AuthProcedure.none:
            break;
        }
      },
      timeout: const Duration(seconds: 30),
    );
  }

  static Future<void> sendEmailAuthCode({
    required String emailAddress,
    required BuildContext buildContext,
    required AuthProcedure authProcedure,
  }) async {
    try {
      final emailSignupResponse = await AirqoApiClient()
          .requestEmailVerificationCode(emailAddress, false);

      if (emailSignupResponse == null) {
        switch (authProcedure) {
          case AuthProcedure.login:
          case AuthProcedure.signup:
            buildContext.read<EmailAuthBloc>().add(const EmailValidationFailed(
                  AuthenticationError.authFailure,
                ));
            break;
          case AuthProcedure.deleteAccount:
            buildContext.read<AccountBloc>().add(const AccountDeletionCheck(
                error: AuthenticationError.authFailure, passed: false));
            break;
          case AuthProcedure.anonymousLogin:
          case AuthProcedure.logout:
          case AuthProcedure.none:
            break;
        }
      } else {
        buildContext.read<AuthCodeBloc>().add(UpdateEmailCredentials(
              emailVerificationLink: emailSignupResponse.loginLink,
              emailToken: emailSignupResponse.token,
            ));

        switch (authProcedure) {
          case AuthProcedure.login:
          case AuthProcedure.signup:
            buildContext
                .read<EmailAuthBloc>()
                .add(const EmailValidationPassed());
            break;
          case AuthProcedure.deleteAccount:
            buildContext
                .read<AccountBloc>()
                .add(const AccountDeletionCheck(passed: true));
            break;
          case AuthProcedure.anonymousLogin:
          case AuthProcedure.logout:
          case AuthProcedure.none:
            break;
        }
      }
    } catch (exception, stackTrace) {
      buildContext
          .read<EmailAuthBloc>()
          .add(const EmailValidationFailed(AuthenticationError.authFailure));
      await logException(
        exception,
        stackTrace,
      );
    }
  }

  static Future<bool> updateCredentials({
    required AuthMethod authMethod,
    required BuildContext context,
    String? emailAddress,
    PhoneAuthCredential? phoneCredential,
  }) async {
    final hasConnection = await hasNetworkConnection();
    if (!hasConnection) {
      return false;
    }
    try {
      final profile = await Profile.getProfile();
      switch (authMethod) {
        case AuthMethod.phone:
          await FirebaseAuth.instance.currentUser!
              .updatePhoneNumber(phoneCredential!)
              .then(
            (_) {
              profile.update();
            },
          );
          break;
        case AuthMethod.email:
          await FirebaseAuth.instance.currentUser!
              .updateEmail(emailAddress!)
              .then(
            (_) {
              profile.update();
            },
          );
          break;
        case AuthMethod.none:
          break;
      }

      return true;
    } on FirebaseAuthException catch (exception) {
      var error = 'Failed to change credentials. Try again later';
      switch (exception.code) {
        case 'email-already-in-use':
          error = 'Email Address already taken';
          break;
        case 'invalid-email':
          error = 'Invalid email address';
          break;
        case 'credential-already-in-use':
          error = 'Phone number already taken';
          break;
        case 'invalid-verification-id':
          error = 'Failed to change phone number. Try again later';
          break;
        case 'session-expired':
          error = 'Your code has expired. Try again later';
          break;
      }

      showSnackBar(
        context,
        error,
      );
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return false;
  }
}
