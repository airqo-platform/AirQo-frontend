// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Kya _$KyaFromJson(Map<String, dynamic> json) => Kya(
      json['title'] as String,
      json['imageUrl'] as String,
      json['id'] as String,
      (json['kyaItems'] as List<dynamic>)
          .map((e) => KyaItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      (json['progress'] as num?)?.toDouble() ?? 0.0,
    );

KyaItem _$KyaItemFromJson(Map<String, dynamic> json) => KyaItem(
      json['title'] as String,
      json['imageUrl'] as String,
      json['body'] as String,
    );

Map<String, dynamic> _$KyaItemToJson(KyaItem instance) => <String, dynamic>{
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'body': instance.body,
    };

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'progress': instance.progress,
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'id': instance.id,
      'kyaItems': instance.kyaItems.map((e) => e.toJson()).toList(),
    };
