import 'package:json_annotation/json_annotation.dart';

part 'userDetails.g.dart';

@JsonSerializable()
class UserDetails {
  String firstName;
  String id;
  String lastName;
  String emailAddress;
  String phoneNumber;
  String device;
  String photoUrl;

  UserDetails(this.firstName, this.id, this.lastName, this.emailAddress,
      this.phoneNumber, this.device, this.photoUrl);

  // @JsonKey(ignore: true)
  // String password = '';

  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);

  String getFullName() {
    return '$firstName $lastName';
  }

  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);

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
}
