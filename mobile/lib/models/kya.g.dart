// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Kya _$KyaFromJson(Map<String, dynamic> json) => Kya(
      title: json['title'] as String,
      imageUrl: json['image'] as String,
      id: json['_id'] as String,
      lessons: (json['tasks'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      completionMessage: json['completion_message'] as String? ??
          'You just finished your first Know You Air Lesson',
      shareLink: json['shareLink'] as String? ?? '',
    );

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'title': instance.title,
      'completion_message': instance.completionMessage,
      'image': instance.imageUrl,
      '_id': instance.id,
      'tasks': instance.lessons.map((e) => e.toJson()).toList(),
      'shareLink': instance.shareLink,
      'progress': instance.progress,
    };

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      id: json['_id'] as String,
      title: json['title'] as String,
      imageUrl: json['image'] as String,
      body: json['content'] as String,
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'image': instance.imageUrl,
      'content': instance.body,
    };

KyaProgress _$KyaProgressFromJson(Map<String, dynamic> json) => KyaProgress(
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      kyaId: json['lesson_id'] as String,
      id: json['_id'] as String?,
    );

Map<String, dynamic> _$KyaProgressToJson(KyaProgress instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'progress': instance.progress,
      'lesson_id': instance.kyaId,
    };

KyaList _$KyaListFromJson(Map<String, dynamic> json) => KyaList(
      data: (json['data'] as List<dynamic>)
          .map((e) => Kya.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$KyaListToJson(KyaList instance) => <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
