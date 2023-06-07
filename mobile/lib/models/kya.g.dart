// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kya.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

KyaLesson _$KyaLessonFromJson(Map<String, dynamic> json) => KyaLesson(
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      id: json['id'] as String,
      tasks: (json['tasks'] as List<dynamic>?)
              ?.map((e) => KyaTask.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      status: $enumDecodeNullable(_$KyaLessonStatusEnumMap, json['status']) ??
          KyaLessonStatus.todo,
      completionMessage: json['completionMessage'] as String? ??
          'You just finished your first Know Your Air Lesson',
      shareLink: json['shareLink'] as String? ?? '',
    );

Map<String, dynamic> _$KyaLessonToJson(KyaLesson instance) => <String, dynamic>{
      'title': instance.title,
      'completionMessage': instance.completionMessage,
      'imageUrl': instance.imageUrl,
      'id': instance.id,
      'tasks': instance.tasks.map((e) => e.toJson()).toList(),
      'status': _$KyaLessonStatusEnumMap[instance.status]!,
      'shareLink': instance.shareLink,
    };

const _$KyaLessonStatusEnumMap = {
  KyaLessonStatus.todo: 'TODO',
  KyaLessonStatus.inProgress: 'IN_PROGRESS',
  KyaLessonStatus.pendingTransfer: 'PENDING_TRANSFER',
  KyaLessonStatus.complete: 'COMPLETE',
};

KyaTask _$KyaTaskFromJson(Map<String, dynamic> json) => KyaTask(
      title: json['title'] as String,
      imageUrl: json['imageUrl'] as String,
      status: $enumDecodeNullable(_$KyaTaskStatusEnumMap, json['status']) ??
          KyaTaskStatus.todo,
      body: json['body'] as String,
      id: json['id'] as String,
    );

Map<String, dynamic> _$KyaTaskToJson(KyaTask instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'imageUrl': instance.imageUrl,
      'body': instance.body,
      'status': _$KyaTaskStatusEnumMap[instance.status]!,
    };

const _$KyaTaskStatusEnumMap = {
  KyaTaskStatus.todo: 'TODO',
  KyaTaskStatus.complete: 'COMPLETE',
};

KyaLessonsList _$KyaLessonsListFromJson(Map<String, dynamic> json) =>
    KyaLessonsList(
      lessons: (json['lessons'] as List<dynamic>)
          .map((e) => KyaLesson.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$KyaLessonsListToJson(KyaLessonsList instance) =>
    <String, dynamic>{
      'lessons': instance.lessons.map((e) => e.toJson()).toList(),
    };

KyaUserLesson _$KyaUserLessonFromJson(Map<String, dynamic> json) =>
    KyaUserLesson(
      id: json['id'] as String,
      tasks: (json['tasks'] as List<dynamic>)
          .map((e) => KyaUserTask.fromJson(e as Map<String, dynamic>))
          .toList(),
      status: $enumDecodeNullable(_$KyaLessonStatusEnumMap, json['status']) ??
          KyaLessonStatus.todo,
    );

Map<String, dynamic> _$KyaUserLessonToJson(KyaUserLesson instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tasks': instance.tasks.map((e) => e.toJson()).toList(),
      'status': _$KyaLessonStatusEnumMap[instance.status]!,
    };

KyaUserTask _$KyaUserTaskFromJson(Map<String, dynamic> json) => KyaUserTask(
      status: $enumDecodeNullable(_$KyaTaskStatusEnumMap, json['status']) ??
          KyaTaskStatus.todo,
      id: json['id'] as String? ?? '',
    );

Map<String, dynamic> _$KyaUserTaskToJson(KyaUserTask instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': _$KyaTaskStatusEnumMap[instance.status]!,
    };
