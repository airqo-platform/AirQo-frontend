import 'package:json_annotation/json_annotation.dart';

part 'user_details.g.dart';

@JsonSerializable(explicitToJson: true)
class UserDetails {
  @JsonKey(defaultValue: '')
  String title = '';

  @JsonKey(defaultValue: '')
  String firstName = '';

  @JsonKey(defaultValue: '')
  String userId = '';

  @JsonKey(defaultValue: '')
  String lastName = '';

  @JsonKey(defaultValue: '')
  String emailAddress = '';

  @JsonKey(defaultValue: '')
  String phoneNumber = '';

  @JsonKey(defaultValue: '')
  String device = '';

  @JsonKey(defaultValue: 0)
  int utcOffset = 0;

  @JsonKey(defaultValue: '')
  String photoUrl = '';

  UserPreferences preferences = UserPreferences.initialize();

  UserDetails(
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

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);

  String getFullName() {
    var fullName = '$firstName $lastName'.trim();

    return fullName.isEmpty ? 'Hello' : fullName;
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

  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);

  @override
  String toString() {
    return 'UserDetails{firstName: $firstName, userId: $userId, '
        'lastName: $lastName, emailAddress: $emailAddress, '
        'phoneNumber: $phoneNumber, device: $device, photoUrl: $photoUrl}';
  }

  static List<String> getNames(String fullName) {
    var namesArray = fullName.split(' ');
    if (namesArray.isEmpty) {
      return ['', ''];
    }
    if (namesArray.length >= 2) {
      return [namesArray.first, namesArray[1]];
    } else {
      return [namesArray.first, ''];
    }
  }

  static UserDetails initialize() {
    return UserDetails(
        title: '',
        firstName: '',
        lastName: '',
        userId: '',
        emailAddress: '',
        phoneNumber: '',
        device: '',
        preferences: UserPreferences(
            notifications: false, location: false, alerts: false, aqShares: 0),
        utcOffset: 0,
        photoUrl: '');
  }

  static UserDetails parseUserDetails(dynamic jsonBody) {
    return UserDetails.fromJson(jsonBody);
  }
}

@JsonSerializable(explicitToJson: true)
class UserPreferences {
  @JsonKey(defaultValue: false)
  bool notifications;

  @JsonKey(defaultValue: false)
  bool location;

  @JsonKey(defaultValue: false)
  bool alerts;

  @JsonKey(defaultValue: 0)
  int aqShares;

  UserPreferences(
      {required this.notifications,
      required this.location,
      required this.alerts,
      required this.aqShares});

  factory UserPreferences.fromJson(Map<String, dynamic> json) =>
      _$UserPreferencesFromJson(json);

  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);

  @override
  String toString() {
    return 'UserPreferences{notifications: $notifications,'
        ' location: $location, alerts: $alerts}';
  }

  static UserPreferences initialize() {
    return UserPreferences(
        notifications: false, location: false, alerts: false, aqShares: 0);
  }
}
