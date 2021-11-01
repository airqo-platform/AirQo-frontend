// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'topicData.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TopicData _$TopicDataFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const ['message'],
  );
  return TopicData(
    message: json['message'] as String,
    siteId: json['site_id'] as String,
  );
}

Map<String, dynamic> _$TopicDataToJson(TopicData instance) => <String, dynamic>{
      'message': instance.message,
      'site_id': instance.siteId,
    };
