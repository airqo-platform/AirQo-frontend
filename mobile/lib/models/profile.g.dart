// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Profile _$ProfileFromJson(Map<String, dynamic> json) => Profile(
      title: json['title'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      emailAddress: json['emailAddress'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      device: json['device'] as String? ?? '',
      photoUrl: json['photoUrl'] as String? ?? '',
      utcOffset: json['utcOffset'] as int? ?? 0,
      notifications: json['notifications'] as bool? ?? false,
      location: json['location'] as bool? ?? false,
      aqShares: json['aqShares'] as int? ?? 0,
      isAnonymous: json['isAnonymous'] as bool? ?? false,
      isSignedIn: json['isSignedIn'] as bool? ?? false,
      lastRated: json['last_rated'] == null
          ? null
          : DateTime.parse(json['last_rated'] as String),
    );

Map<String, dynamic> _$ProfileToJson(Profile instance) => <String, dynamic>{
      'title': instance.title,
      'firstName': instance.firstName,
      'userId': instance.userId,
      'lastName': instance.lastName,
      'emailAddress': instance.emailAddress,
      'phoneNumber': instance.phoneNumber,
      'device': instance.device,
      'utcOffset': instance.utcOffset,
      'photoUrl': instance.photoUrl,
      'notifications': instance.notifications,
      'location': instance.location,
      'aqShares': instance.aqShares,
      'isAnonymous': instance.isAnonymous,
      'isSignedIn': instance.isSignedIn,
      'last_rated': instance.lastRated?.toIso8601String(),
    };
