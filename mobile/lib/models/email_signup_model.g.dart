// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'email_signup_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EmailSignupModel _$EmailSignupModelFromJson(Map<String, dynamic> json) =>
    EmailSignupModel(
      json['success'] as bool,
      json['message'] as String,
      json['login_link'] as String,
      json['token'] as String,
      json['email'] as String,
    );

Map<String, dynamic> _$EmailSignupModelToJson(EmailSignupModel instance) =>
    <String, dynamic>{
      'success': instance.success,
      'token': instance.token,
      'email': instance.email,
      'message': instance.message,
      'login_link': instance.loginLink,
    };
