// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_details.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDetails _$UserDetailsFromJson(Map<String, dynamic> json) => UserDetails(
      title: json['title'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      emailAddress: json['emailAddress'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      device: json['device'] as String? ?? '',
      preferences:
          UserPreferences.fromJson(json['preferences'] as Map<String, dynamic>),
      photoUrl: json['photoUrl'] as String? ?? '',
      utcOffset: json['utcOffset'] as int? ?? 0,
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
      'utcOffset': instance.utcOffset,
      'photoUrl': instance.photoUrl,
      'preferences': instance.preferences.toJson(),
    };

UserPreferences _$UserPreferencesFromJson(Map<String, dynamic> json) =>
    UserPreferences(
      notifications: json['notifications'] as bool? ?? false,
      location: json['location'] as bool? ?? false,
      alerts: json['alerts'] as bool? ?? false,
      aqShares: json['aqShares'] as int? ?? 0,
    );

Map<String, dynamic> _$UserPreferencesToJson(UserPreferences instance) =>
    <String, dynamic>{
      'notifications': instance.notifications,
      'location': instance.location,
      'alerts': instance.alerts,
      'aqShares': instance.aqShares,
    };
