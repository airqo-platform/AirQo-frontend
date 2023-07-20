// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      title: json['title'] as String,
      imageUrl: json['image'] as String,
      id: json['_id'] as String,
      tasks: (json['tasks'] as List<dynamic>)
          .map((e) => KyaTask.fromJson(e as Map<String, dynamic>))
          .toList(),
      progress: (json['kya_user_progress'] as num?)?.toDouble() ?? 0,
      completionMessage: json['completion_message'] as String,
      shareLink: json['shareLink'] as String? ?? '',
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      'title': instance.title,
      'completion_message': instance.completionMessage,
      'image': instance.imageUrl,
      '_id': instance.id,
      'tasks': instance.tasks.map((e) => e.toJson()).toList(),
      'shareLink': instance.shareLink,
      'kya_user_progress': instance.progress,
    };

KyaTask _$KyaTaskFromJson(Map<String, dynamic> json) => KyaTask(
      id: json['_id'] as String,
      title: json['title'] as String,
      imageUrl: json['image'] as String,
      content: json['content'] as String,
    );

Map<String, dynamic> _$KyaTaskToJson(KyaTask instance) => <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'image': instance.imageUrl,
      'content': instance.content,
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
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$KyaListToJson(KyaList instance) => <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
