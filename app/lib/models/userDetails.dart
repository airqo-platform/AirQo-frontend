import 'package:app/models/site.dart';
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
  String password;
  String photoUrl;

@JsonKey(ignore: true)
  // String password = '';


  factory UserDetails.fromJson(Map<String, dynamic> json) =>
      _$UserDetailsFromJson(json);


  UserDetails(this.firstName, this.id, this.lastName, this.emailAddress,
      this.phoneNumber, this.device, this.password, this.photoUrl);

  Map<String, dynamic> toJson() => _$UserDetailsToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${userDb()}('
      'id INTEGER PRIMARY KEY, ${dbEmailAddress()} TEXT,'
      '${dbLastName()} TEXT, '
      '${dbPhoneNumber()} TEXT, ${dbFirstName()} TEXT)';

  static String dbFirstName() => 'lower';

  static String dbLastName() => 'time';

  static String dbEmailAddress() => 'upper';

  static String dbPhoneNumber() => 'value';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${userDb()}';

  static String userDb() => 'user_db';

}
