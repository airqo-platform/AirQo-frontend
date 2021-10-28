import 'package:json_annotation/json_annotation.dart';

part 'userDetails.g.dart';

@JsonSerializable()
class UserDetails {
  String title;
  String firstName;
  String userId;
  String lastName;
  String emailAddress;
  String phoneNumber;
  String device;
  String photoUrl;

  UserDetails(this.title, this.firstName, this.userId, this.lastName,
      this.emailAddress, this.phoneNumber, this.device, this.photoUrl);

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);

  String getFullName() {
    return '$firstName $lastName';
  }

  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);

  @override
  String toString() {
    return 'UserDetails{firstName: $firstName, userId: $userId, '
        'lastName: $lastName, emailAddress: $emailAddress, '
        'phoneNumber: $phoneNumber, device: $device, photoUrl: $photoUrl}';
  }

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      '${dbId()} TEXT PRIMARY KEY, ${dbEmailAddress()} TEXT,'
      '${dbLastName()} TEXT, ${dbDevice()} TEXT, ${dbPhotoUrl()} TEXT, '
      '${dbPhoneNumber()} TEXT, ${dbFirstName()} TEXT)';

  static String dbDevice() => 'device';

  static String dbEmailAddress() => 'emailAddress';

  static String dbFirstName() => 'firstName';

  static String dbId() => 'id';

  static String dbLastName() => 'lastName';

  static String dbName() => 'user_db';

  static String dbPhoneNumber() => 'phoneNumber';

  static String dbPhotoUrl() => 'photoUrl';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

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
    return UserDetails('', '', '', '', '', '', '', '');
  }
}
