// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'hourly.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Hourly _$HourlyFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const ['channel_id']);
  return Hourly(
    json['channel_id'] as int,
    json['time'] as String,
    (json['pm2_5'] as num).toDouble(),
  );
}

Map<String, dynamic> _$HourlyToJson(Hourly instance) => <String, dynamic>{
      'channel_id': instance.channelId,
      'time': instance.time,
      'pm2_5': instance.pm2_5,
    };
