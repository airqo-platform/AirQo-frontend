// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Kya _$KyaFromJson(Map<String, dynamic> json) => Kya(
      json['title'] as String,
      json['imageUrl'] as String,
      json['id'] as String,
      (json['lessons'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
      (json['progress'] as num?)?.toDouble() ?? 0.0,
    );

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      json['title'] as String,
      json['imageUrl'] as String,
      json['body'] as String,
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'body': instance.body,
    };

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'progress': instance.progress,
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'id': instance.id,
      'lessons': instance.lessons.map((e) => e.toJson()).toList(),
    };

UserKya _$UserKyaFromJson(Map<String, dynamic> json) => UserKya(
      json['id'] as String,
      (json['progress'] as num?)?.toDouble() ?? 0.0,
    );

Map<String, dynamic> _$UserKyaToJson(UserKya instance) => <String, dynamic>{
      'progress': instance.progress,
      'id': instance.id,
    };
