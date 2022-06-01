import 'package:app/utils/extensions.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../constants/config.dart';
import '../services/firebase_service.dart';
import '../services/native_api.dart';
import '../utils/network.dart';
import 'enum_constants.dart';

part 'profile.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 20, adapterName: 'ProfileAdapter')
class Profile extends HiveObject {
  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);

  Profile(
      {required this.title,
      required this.firstName,
      required this.lastName,
      required this.userId,
      required this.emailAddress,
      required this.phoneNumber,
      required this.device,
      required this.preferences,
      required this.photoUrl,
      required this.utcOffset});
  @HiveField(0)
  @JsonKey(defaultValue: '')
  String title = '';

  @HiveField(1)
  @JsonKey(defaultValue: '')
  String firstName = '';

  @HiveField(2)
  @JsonKey(defaultValue: '')
  String userId = '';

  @HiveField(3, defaultValue: '')
  @JsonKey(defaultValue: '')
  String lastName = '';

  @HiveField(4, defaultValue: '')
  @JsonKey(defaultValue: '')
  String emailAddress = '';

  @HiveField(5, defaultValue: '')
  @JsonKey(defaultValue: '')
  String phoneNumber = '';

  @HiveField(6, defaultValue: '')
  @JsonKey(defaultValue: '')
  String device = '';

  @HiveField(7, defaultValue: 0)
  @JsonKey(defaultValue: 0)
  int utcOffset = 0;

  @HiveField(8, defaultValue: '')
  @JsonKey(defaultValue: '')
  String photoUrl = '';

  @HiveField(9)
  @JsonKey(required: false)
  UserPreferences preferences =
      UserPreferences(notifications: false, aqShares: 0, location: false);

  String getProfileViewName() {
    if (firstName != '') {
      return firstName.trim();
    } else if (lastName != '') {
      return lastName.trim();
    } else {
      return 'Hello';
    }
  }

  static Future<Profile> getProfile() async {
    return Hive.box<Profile>(HiveBox.profile).get(HiveBox.profile) ??
        await _initialize();
  }

  Gender getGender() {
    if (title
        .toLowerCase()
        .contains(TitleOptions.mr.getValue().toLowerCase())) {
      return Gender.male;
    } else if (title
        .toLowerCase()
        .contains(TitleOptions.ms.getValue().toLowerCase())) {
      return Gender.female;
    } else {
      return Gender.undefined;
    }
  }

  String getInitials() {
    var initials = '';
    if (firstName.isNotEmpty) {
      initials = firstName[0].toUpperCase();
    }

    if (lastName.isNotEmpty) {
      initials = '$initials${lastName[0].toUpperCase()}';
    }

    return initials.isEmpty ? 'A' : initials;
  }

  Map<String, dynamic> toJson() => _$ProfileToJson(this);

  static Future<void> syncProfile() async {
    final hasConnection = await hasNetworkConnection();
    if (hasConnection && CustomAuth.isLoggedIn()) {
      final profile = await CloudStore.getProfile();
      await profile.update();
    }
  }

  Future<void> update(
      {bool logout = false,
      bool? enableNotification,
      bool? enableLocation}) async {
    final user = CustomAuth.getUser();
    if (user != null) {
      Sentry.configureScope(
        (scope) =>
            scope.user = SentryUser(id: user.uid, email: user.email ?? ''),
      );
      this
        ..userId = user.uid
        ..phoneNumber = user.phoneNumber ?? ''
        ..emailAddress = user.email ?? ''
        ..device = logout ? '' : await CloudMessaging.getDeviceToken() ?? ''
        ..utcOffset = DateTime.now().getUtcOffset()
        ..preferences.notifications = enableNotification ??
            await PermissionService.checkPermission(AppPermission.notification)
        ..preferences.location = enableLocation ??
            await PermissionService.checkPermission(AppPermission.location);

      await Hive.box<Profile>(HiveBox.profile)
          .put(HiveBox.profile, this)
          .then((_) => CloudStore.updateCloudProfile());
    }
  }

  static List<String> getNames(String fullName) {
    final namesArray = fullName.split(' ');
    if (namesArray.isEmpty) {
      return ['', ''];
    }
    if (namesArray.length >= 2) {
      return [namesArray.first, namesArray[1]];
    } else {
      return [namesArray.first, ''];
    }
  }

  static Future<Profile> _initialize() async {
    final profile = Profile(
        title: '',
        firstName: '',
        lastName: '',
        userId: '',
        emailAddress: '',
        phoneNumber: '',
        device: '',
        preferences:
            UserPreferences(notifications: false, location: false, aqShares: 0),
        utcOffset: 0,
        photoUrl: '');
    final user = CustomAuth.getUser();
    if (user != null) {
      await profile.update();
    }
    return profile;
  }

  static Profile parseUserDetails(dynamic jsonBody) {
    return Profile.fromJson(jsonBody);
  }
}

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 120, adapterName: 'UserPreferencesTypeAdapter')
class UserPreferences extends HiveObject {
  UserPreferences(
      {required this.notifications,
      required this.location,
      required this.aqShares});

  factory UserPreferences.fromJson(Map<String, dynamic> json) =>
      _$UserPreferencesFromJson(json);
  @HiveField(0, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  bool notifications;

  @HiveField(1, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  bool location;

  @HiveField(2, defaultValue: 0)
  @JsonKey(defaultValue: 0, required: false)
  int aqShares;

  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);

  static UserPreferences initialize() {
    return UserPreferences(notifications: false, location: false, aqShares: 0);
  }
}
