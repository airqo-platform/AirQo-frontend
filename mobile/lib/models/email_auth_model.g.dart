// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'email_auth_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EmailAuthModel _$EmailAuthModelFromJson(Map<String, dynamic> json) =>
    EmailAuthModel(
      validToken: json['token'] as int,
      emailAddress: json['email'] as String,
      signInLink: json['login_link'] as String? ?? '',
      reAuthenticationLink: json['auth_link'] as String? ?? '',
    );
