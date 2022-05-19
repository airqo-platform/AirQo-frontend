import 'package:app/utils/extensions.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'user_details.g.dart';

@JsonSerializable(explicitToJson: true)
class UserDetails {
  @JsonKey(defaultValue: '', required: false)
  String title = '';

  @JsonKey(defaultValue: '', required: false)
  String firstName = '';

  @JsonKey(defaultValue: '', required: false)
  String userId = '';

  @JsonKey(defaultValue: '', required: false)
  String lastName = '';

  @JsonKey(defaultValue: '', required: false)
  String emailAddress = '';

  @JsonKey(defaultValue: '', required: false)
  String phoneNumber = '';

  @JsonKey(defaultValue: '', required: false)
  String device = '';

  @JsonKey(defaultValue: '', required: false)
  String photoUrl = '';

  @JsonKey(required: false)
  UserPreferences preferences = UserPreferences(false, false, false, 0);

  UserDetails(
      this.title,
      this.firstName,
      this.userId,
      this.lastName,
      this.emailAddress,
      this.phoneNumber,
      this.device,
      this.photoUrl,
      this.preferences);

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);

  String getFullName() {
    var fullName = '$firstName $lastName'.trim();

    return fullName.isEmpty ? 'Hello' : fullName;
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
    return UserDetails('Ms.', '', '', '', '', '', '', '',
        UserPreferences(false, false, false, 0));
  }

  static UserDetails parseUserDetails(dynamic jsonBody) {
    return UserDetails.fromJson(jsonBody);
  }
}

@JsonSerializable(explicitToJson: true)
class UserPreferences {
  @JsonKey(defaultValue: false, required: false)
  bool notifications;

  @JsonKey(defaultValue: false, required: false)
  bool location;

  @JsonKey(defaultValue: false, required: false)
  bool alerts;

  @JsonKey(defaultValue: 0, required: false)
  int aqShares;

  UserPreferences(
      this.notifications, this.location, this.alerts, this.aqShares);

  factory UserPreferences.fromJson(Map<String, dynamic> json) =>
      _$UserPreferencesFromJson(json);

  Map<String, dynamic> toJson() => _$UserPreferencesToJson(this);

  @override
  String toString() {
    return 'UserPreferences{notifications: $notifications,'
        ' location: $location, alerts: $alerts}';
  }
}
