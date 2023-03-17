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
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      completionMessage: json['completionMessage'] as String? ??
          'You just finished your first Know You Air Lesson',
      secondaryImageUrl: json['secondaryImageUrl'] as String? ?? '',
      shareLink: json['shareLink'] as String? ?? '',
    );

Map<String, dynamic> _$KyaToJson(Kya instance) => <String, dynamic>{
      'title': instance.title,
      'completionMessage': instance.completionMessage,
      'imageUrl': instance.imageUrl,
      'secondaryImageUrl': instance.secondaryImageUrl,
      'id': instance.id,
      'lessons': instance.lessons.map((e) => e.toJson()).toList(),
      'progress': instance.progress,
      'shareLink': instance.shareLink,
    };

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      body: json['body'] as String,
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'body': instance.body,
    };

KyaProgress _$KyaProgressFromJson(Map<String, dynamic> json) => KyaProgress(
      id: json['id'] as String,
      progress: (json['progress'] as num).toDouble(),
    );

Map<String, dynamic> _$KyaProgressToJson(KyaProgress instance) =>
    <String, dynamic>{
      'id': instance.id,
      'progress': instance.progress,
    };

KyaList _$KyaListFromJson(Map<String, dynamic> json) => KyaList(
      data: (json['data'] as List<dynamic>)
          .map((e) => Kya.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$KyaListToJson(KyaList instance) => <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
    };
