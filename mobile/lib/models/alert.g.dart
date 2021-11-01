// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'alert.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Alert _$AlertFromJson(Map<String, dynamic> json) => Alert(
      json['receiver'] as String,
      json['siteId'] as String,
      json['type'] as String,
      json['hour'] as int,
      json['airQuality'] as String,
      json['siteName'] as String,
    );

Map<String, dynamic> _$AlertToJson(Alert instance) => <String, dynamic>{
      'receiver': instance.receiver,
      'siteId': instance.siteId,
      'siteName': instance.siteName,
      'type': instance.type,
      'hour': instance.hour,
      'airQuality': instance.airQuality,
    };
