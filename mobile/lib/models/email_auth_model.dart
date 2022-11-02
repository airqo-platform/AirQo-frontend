import 'package:app/utils/utils.dart';
import 'package:json_annotation/json_annotation.dart';

part 'email_auth_model.g.dart';

@JsonSerializable()
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

  Map<String, dynamic> toJson() => _$EmailAuthModelToJson(this);

  static EmailAuthModel? parseEmailAuthModel(dynamic jsonBody) {
    try {
      return EmailAuthModel.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);
    }

    return null;
  }
}
