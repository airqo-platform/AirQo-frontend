// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Kya _$KyaFromJson(Map<String, dynamic> json) => Kya(
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      id: json['id'] as String,
      lessons: (json['lessons'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
      progress: json['progress'] as int? ?? 0,
      completionMessage: json['completionMessage'] as String? ??
          'You just finished your first Know You Air Lesson',
      secondaryImageUrl: json['secondaryImageUrl'] as String? ?? '',
    );

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'progress': instance.progress,
      'title': instance.title,
      'completionMessage': instance.completionMessage,
      'imageUrl': instance.imageUrl,
      'secondaryImageUrl': instance.secondaryImageUrl,
      'id': instance.id,
      'lessons': instance.lessons.map((e) => e.toJson()).toList(),
    };

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

UserKya _$UserKyaFromJson(Map<String, dynamic> json) => UserKya(
      json['id'] as String,
      json['progress'] as int? ?? 0,
    );

Map<String, dynamic> _$UserKyaToJson(UserKya instance) => <String, dynamic>{
      'progress': instance.progress,
      'id': instance.id,
    };
