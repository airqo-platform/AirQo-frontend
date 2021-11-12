import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

part 'email_signup_model.g.dart';

@JsonSerializable()
class EmailSignupModel {
  final bool success;
  final int token;
  final String email;
  final String message;

  @JsonKey(name: 'login_link')
  final String loginLink;

  EmailSignupModel(
      this.success, this.message, this.loginLink, this.token, this.email);

  factory EmailSignupModel.fromJson(Map<String, dynamic> json) =>
      _$EmailSignupModelFromJson(json);

  Map<String, dynamic> toJson() => _$EmailSignupModelToJson(this);

  static EmailSignupModel? parseEmailSignupModel(dynamic jsonBody) {
    try {
      var emailSignupModel = EmailSignupModel.fromJson(jsonBody);
      return emailSignupModel;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }

    return null;
  }
}
