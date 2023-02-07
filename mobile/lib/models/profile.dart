import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:uuid/uuid.dart';

import 'enum_constants.dart';

part 'profile.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 20)
class Profile extends HiveObject with EquatableMixin {
  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);

  Profile({
    required this.title,
    required this.firstName,
    required this.lastName,
    required this.userId,
    required this.emailAddress,
    required this.phoneNumber,
    required this.device,
    required this.preferences,
    required this.photoUrl,
    required this.utcOffset,
    this.user,
  });

  @HiveField(0)
  @JsonKey(defaultValue: '')
  final String title;

  @HiveField(1)
  @JsonKey(defaultValue: '')
  final String firstName;

  @HiveField(2)
  @JsonKey(defaultValue: '')
  final String userId;

  @HiveField(3, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String lastName;

  @HiveField(4, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String emailAddress;

  @HiveField(5, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String phoneNumber;

  @HiveField(6, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String device;

  @HiveField(7, defaultValue: 0)
  @JsonKey(defaultValue: 0)
  final int utcOffset;

  @HiveField(8, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String photoUrl;

  @HiveField(9)
  @JsonKey(required: false)
  final UserPreferences preferences;

  @JsonKey(includeFromJson: false, includeToJson: false)
  final User? user;

  Profile copyWith({
    String? title,
    String? firstName,
    String? userId,
    String? lastName,
    String? emailAddress,
    String? phoneNumber,
    String? device,
    int? utcOffset,
    String? photoUrl,
    UserPreferences? preferences,
    User? user,
  }) {
    return Profile(
      title: title ?? this.title,
      firstName: firstName ?? this.firstName,
      userId: userId ?? this.userId,
      lastName: lastName ?? this.lastName,
      emailAddress: emailAddress ?? this.emailAddress,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      device: device ?? this.device,
      utcOffset: utcOffset ?? this.utcOffset,
      photoUrl: photoUrl ?? this.photoUrl,
      preferences: preferences ?? this.preferences,
      user: user ?? this.user,
    );
  }

  Future<Profile> setUserCredentials() async {
    String? userId;
    String? emailAddress;
    String? phoneNumber;

    final user = CustomAuth.getUser();
    if (user != null) {
      phoneNumber = user.phoneNumber;
      emailAddress = user.email;
      userId = user.uid;
    }

    return Profile(
      userId: userId ?? this.userId,
      emailAddress: emailAddress ?? this.emailAddress,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      lastName: lastName,
      title: title,
      firstName: firstName,
      device: await CloudMessaging.getDeviceToken() ?? device,
      utcOffset: DateTime.now().getUtcOffset(),
      photoUrl: photoUrl,
      preferences: preferences,
      user: user,
    );
  }

  static Future<Profile> create() async {
    Profile profile = Profile(
      title: TitleOptions.ms.value,
      firstName: '',
      lastName: '',
      userId: const Uuid().v4(),
      emailAddress: '',
      phoneNumber: '',
      device: await CloudMessaging.getDeviceToken() ?? '',
      preferences: UserPreferences.initialize(),
      utcOffset: DateTime.now().getUtcOffset(),
      photoUrl: '',
      user: null,
    );

    return await profile.setUserCredentials();
  }

  Map<String, dynamic> toJson() => _$ProfileToJson(this);

  @override
  List<Object?> get props => [
        title,
        firstName,
        userId,
        lastName,
        emailAddress,
        photoUrl,
        phoneNumber,
        utcOffset,
        device,
        preferences,
        // user, intentionally left out
      ];
}

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 120)
class UserPreferences extends HiveObject with EquatableMixin {
  UserPreferences({
    required this.notifications,
    required this.location,
    required this.aqShares,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) =>
      _$UserPreferencesFromJson(json);

  UserPreferences copyWith({
    int? aqShares,
    bool? location,
    bool? notifications,
  }) {
    return UserPreferences(
      notifications: notifications ?? this.notifications,
      location: location ?? this.location,
      aqShares: aqShares ?? this.aqShares,
    );
  }

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

  factory UserPreferences.initialize() {
    return UserPreferences(
      notifications: false,
      location: false,
      aqShares: 0,
    );
  }

  @override
  List<Object?> get props => [
        aqShares,
        location,
        notifications,
      ];
}
