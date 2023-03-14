import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

part 'profile.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 20)
class Profile extends HiveObject with EquatableMixin {
  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);

  factory Profile.initialize() => Profile(
        title: '',
        firstName: '',
        lastName: '',
        userId: '',
        emailAddress: '',
        phoneNumber: '',
        device: '',
        notifications: false,
        location: false,
        aqShares: 0,
        photoUrl: '',
        utcOffset: DateTime.now().getUtcOffset(),
        isAnonymous: true,
        isSignedIn: false,
      );

  Profile({
    required this.title,
    required this.firstName,
    required this.lastName,
    required this.userId,
    required this.emailAddress,
    required this.phoneNumber,
    required this.device,
    required this.photoUrl,
    required this.utcOffset,
    required this.notifications,
    required this.location,
    required this.aqShares,
    required this.isAnonymous,
    required this.isSignedIn,
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

  @HiveField(9, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  final bool notifications;

  @HiveField(10, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  final bool location;

  @HiveField(11, defaultValue: 0)
  @JsonKey(defaultValue: 0, required: false)
  final int aqShares;

  @HiveField(12, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  final bool isAnonymous;

  @HiveField(13, defaultValue: false)
  @JsonKey(defaultValue: false, required: false)
  final bool isSignedIn;

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
    bool? notifications,
    bool? location,
    int? aqShares,
    bool? isAnonymous,
    bool? isSignedIn,
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
      notifications: notifications ?? this.notifications,
      location: location ?? this.location,
      aqShares: aqShares ?? this.aqShares,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      isSignedIn: isSignedIn ?? this.isSignedIn,
    );
  }

  Future<Profile> _setUserCredentials() async {
    String? userId;
    String? emailAddress;
    String? phoneNumber;
    bool? isAnonymous;
    bool? isSignedIn;

    final User? user = CustomAuth.getUser();
    if (user != null) {
      phoneNumber = user.phoneNumber;
      emailAddress = user.email;
      userId = user.uid;
      isAnonymous = user.isAnonymous;
      isSignedIn = true;
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
      notifications: notifications,
      location: location,
      aqShares: aqShares,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      isSignedIn: isSignedIn ?? this.isSignedIn,
    );
  }

  static Future<Profile> create() async {
    Profile profile = Profile.initialize();
    return await profile._setUserCredentials();
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
        notifications,
        location,
        aqShares,
        isAnonymous,
        isSignedIn,
      ];
}
