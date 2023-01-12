import 'package:json_annotation/json_annotation.dart';

part 'email_auth_model.g.dart';

@JsonSerializable(createToJson: false)
class EmailAuthModel {
  EmailAuthModel(
    this.success,
    this.token,
    this.email,
    this.message,
    this.loginLink,
    this.authLink,
  );

  factory EmailAuthModel.fromJson(Map<String, dynamic> json) =>
      _$EmailAuthModelFromJson(json);
  final bool success;
  final int token;
  final String email;
  final String message;

  @JsonKey(name: 'login_link')
  final String loginLink;

  @JsonKey(name: 'auth_link', required: false, defaultValue: '')
  final String authLink;
}
