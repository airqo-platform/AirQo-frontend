// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'userDetails.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDetails _$UserDetailsFromJson(Map<String, dynamic> json) {
  return UserDetails(
    json['firstName'] as String,
    json['id'] as String,
    json['lastName'] as String,
    json['emailAddress'] as String,
    json['phoneNumber'] as String,
    json['device'] as String,
    json['password'] as String,
    json['photoUrl'] as String,
  );
}

Map<String, dynamic> _$UserDetailsToJson(UserDetails instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'id': instance.id,
      'lastName': instance.lastName,
      'emailAddress': instance.emailAddress,
      'phoneNumber': instance.phoneNumber,
      'device': instance.device,
      'password': instance.password,
      'photoUrl': instance.photoUrl,
    };
