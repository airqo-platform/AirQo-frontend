// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'userDetails.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDetails _$UserDetailsFromJson(Map<String, dynamic> json) => UserDetails(
      json['title'] as String,
      json['firstName'] as String,
      json['userId'] as String,
      json['lastName'] as String,
      json['emailAddress'] as String,
      json['phoneNumber'] as String,
      json['device'] as String,
      json['photoUrl'] as String,
    );

Map<String, dynamic> _$UserDetailsToJson(UserDetails instance) =>
    <String, dynamic>{
      'title': instance.title,
      'firstName': instance.firstName,
      'userId': instance.userId,
      'lastName': instance.lastName,
      'emailAddress': instance.emailAddress,
      'phoneNumber': instance.phoneNumber,
      'device': instance.device,
      'photoUrl': instance.photoUrl,
    };
