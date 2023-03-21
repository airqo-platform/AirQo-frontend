import 'package:json_annotation/json_annotation.dart';

part 'email_auth_model.g.dart';

@JsonSerializable(createToJson: false)
class EmailAuthModel {
  EmailAuthModel(
    this.token,
    this.emailAddress,
    this.signInLink,
    this.reAuthenticationLink,
  );

  factory EmailAuthModel.fromJson(Map<String, dynamic> json) =>
      _$EmailAuthModelFromJson(json);

  final int token;

  @JsonKey(name: 'email')
  final String emailAddress;

  @JsonKey(name: 'login_link', required: false, defaultValue: '')
  final String signInLink;

  @JsonKey(name: 'auth_link', required: false, defaultValue: '')
  final String reAuthenticationLink;
}
