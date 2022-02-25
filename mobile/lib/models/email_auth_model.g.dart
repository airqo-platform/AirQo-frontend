// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'email_auth_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EmailAuthModel _$EmailAuthModelFromJson(Map<String, dynamic> json) =>
    EmailAuthModel(
      json['success'] as bool,
      json['token'] as int,
      json['email'] as String,
      json['message'] as String,
      json['login_link'] as String,
      json['auth_link'] as String? ?? '',
    );

Map<String, dynamic> _$EmailAuthModelToJson(EmailAuthModel instance) =>
    <String, dynamic>{
      'success': instance.success,
      'token': instance.token,
      'email': instance.email,
      'message': instance.message,
      'login_link': instance.loginLink,
      'auth_link': instance.authLink,
    };
