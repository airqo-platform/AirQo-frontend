import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
class KyaLesson extends Equatable {
  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  const KyaLesson({
    required this.title,
    required this.imageUrl,
    required this.id,
    required this.tasks,
    required this.activeTask,
    required this.status,
    required this.completionMessage,
    required this.hasCompleted,
    this.shareLink,
  });

  final String title;

  @JsonKey(name: 'completion_message')
  final String completionMessage;

  @JsonKey(name: 'image')
  final String imageUrl;

  @JsonKey(name: '_id')
  final String id;

  @JsonKey()
  final List<KyaTask> tasks;

  @JsonKey(name: 'active_task', defaultValue: 1)
  final int activeTask;

  @JsonKey(defaultValue: KyaLessonStatus.todo)
  final KyaLessonStatus status;

  @JsonKey(defaultValue: false)
  final bool hasCompleted;

  @JsonKey(name: 'share_link', defaultValue: '')
  final String? shareLink;

  factory KyaLesson.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return KyaLesson(
      title: '',
      imageUrl: '',
      id: id,
      tasks: const [],
      completionMessage: '',
      shareLink: '',
      activeTask: 1,
      status: KyaLessonStatus.todo,
      hasCompleted: false,
    );
  }

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);

  KyaLesson copyWith({
    String? shareLink,
    KyaLessonStatus? status,
    int? activeTask,
    bool? hasCompleted,
  }) {
    return KyaLesson(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      tasks: tasks,
      status: status ?? this.status,
      activeTask: activeTask ?? this.activeTask,
      hasCompleted: hasCompleted ?? this.hasCompleted,
      shareLink: shareLink ?? this.shareLink,
    );
  }

  String shareLinkParams() {
    return 'kyaId=$id';
  }

  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  @override
  List<Object> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class KyaTask extends Equatable {
  const KyaTask({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.content,
  });

  factory KyaTask.fromJson(Map<String, dynamic> json) {
    return _$KyaTaskFromJson(json);
  }

  @JsonKey(name: '_id')
  final String id;

  final String title;

  @JsonKey(name: 'image')
  final String imageUrl;

  @JsonKey()
  final String content;

  Map<String, dynamic> toJson() => _$KyaTaskToJson(this);

  String imageUrlCacheKey(KyaLesson kya) {
    return 'kya-${kya.id}-${kya.tasks.indexOf(this)}-lesson-image-url';
  }

  @override
  List<Object> get props => [id];
}
