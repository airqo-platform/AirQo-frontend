import 'package:app/services/services.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:json_annotation/json_annotation.dart';

part 'profile.g.dart';

@JsonSerializable()
class Profile extends Equatable {
  factory Profile.fromJson(Map<String, dynamic> json) =>
      _$ProfileFromJson(json);

  factory Profile.initialize() {
    String userId = "";
    String emailAddress = "";
    String phoneNumber = "";
    bool isAnonymous = true;
    DateTime lastRated = DateTime.now();

    final User? user = CustomAuth.getUser();

    if (user != null) {
      phoneNumber = user.phoneNumber ?? "";
      emailAddress = user.email ?? "";
      userId = user.uid;
      isAnonymous = user.isAnonymous;
      lastRated = user.metadata.creationTime ?? DateTime.now();
    }

    return Profile(
      userId: userId,
      emailAddress: emailAddress,
      phoneNumber: phoneNumber,
      device: "",
      lastName: "",
      title: "",
      firstName: "",
      utcOffset: DateTime.now().getUtcOffset(),
      photoUrl: "",
      notifications: false,
      location: false,
      aqShares: 0,
      isAnonymous: isAnonymous,
      isSignedIn: user != null,
      lastRated: lastRated,
    );
  }

  const Profile({
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
    required this.lastRated,
  });

  @JsonKey(defaultValue: '')
  final String title;

  @JsonKey(defaultValue: '')
  final String firstName;

  @JsonKey(defaultValue: '')
  final String userId;

  @JsonKey(defaultValue: '')
  final String lastName;

  @JsonKey(defaultValue: '')
  final String emailAddress;

  @JsonKey(defaultValue: '')
  final String phoneNumber;

  @JsonKey(defaultValue: '')
  final String device;

  @JsonKey(defaultValue: 0)
  final int utcOffset;

  @JsonKey(defaultValue: '')
  final String photoUrl;

  @JsonKey(defaultValue: false, required: false)
  final bool notifications;

  @JsonKey(defaultValue: false, required: false)
  final bool location;

  @JsonKey(defaultValue: 0, required: false)
  final int aqShares;

  @JsonKey(defaultValue: false, required: false)
  final bool isAnonymous;

  @JsonKey(defaultValue: false, required: false)
  final bool isSignedIn;

  @JsonKey(required: false, name: "last_rated")
  final DateTime lastRated;

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
    DateTime? lastRated,
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
      lastRated: lastRated ?? this.lastRated,
    );
  }

  Map<String, dynamic> toJson() => _$ProfileToJson(this);

  @override
  List<Object?> get props => [
        title,
        firstName,
        userId,
        lastName,
        emailAddress,
        phoneNumber,
        device,
        utcOffset,
        photoUrl,
        notifications,
        location,
        aqShares,
        isAnonymous,
        isSignedIn,
        lastRated,
      ];
}
