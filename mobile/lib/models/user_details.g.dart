// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_details.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserDetails _$UserDetailsFromJson(Map<String, dynamic> json) => UserDetails(
      json['title'] as String? ?? '',
      json['firstName'] as String? ?? '',
      json['userId'] as String? ?? '',
      json['lastName'] as String? ?? '',
      json['emailAddress'] as String? ?? '',
      json['phoneNumber'] as String? ?? '',
      json['device'] as String? ?? '',
      json['photoUrl'] as String? ?? '',
      (json['favPlaces'] as List<dynamic>)
          .map((e) => PlaceDetails.fromJson(e as Map<String, dynamic>))
          .toList(),
      UserPreferences.fromJson(json['preferences'] as Map<String, dynamic>),
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
      'favPlaces': instance.favPlaces.map((e) => e.toJson()).toList(),
      'preferences': instance.preferences.toJson(),
    };

UserPreferences _$UserPreferencesFromJson(Map<String, dynamic> json) =>
    UserPreferences(
      json['notifications'] as bool? ?? false,
      json['location'] as bool? ?? false,
      json['alerts'] as bool? ?? false,
      (json['tipsProgress'] as num?)?.toDouble() ?? 0.0,
    );

Map<String, dynamic> _$UserPreferencesToJson(UserPreferences instance) =>
    <String, dynamic>{
      'notifications': instance.notifications,
      'location': instance.location,
      'alerts': instance.alerts,
      'tipsProgress': instance.tipsProgress,
    };
