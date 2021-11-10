import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';

part 'email_signup_model.g.dart';

@JsonSerializable()
class EmailSignupModel {
  final bool success;
  final String token;
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
    } on Error catch (e) {
      debugPrint(e.toString());
    }

    return null;
  }
}
