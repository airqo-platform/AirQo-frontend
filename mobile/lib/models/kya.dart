import 'package:app/utils/extensions.dart';
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
    required this.status,
    required this.completionMessage,
    required this.shareLink,
  });

  final String title;

  @JsonKey(name: 'completion_message',)
  final String completionMessage;

  @JsonKey(name: 'image_url')
  final String imageUrl;

  final String id;

  final List<KyaTask> tasks;

  @JsonKey(defaultValue: KyaLessonStatus.todo)
  final KyaLessonStatus status;

  @JsonKey(name: 'share_link')
  final String shareLink;

  double get progress => completeTasks().length / tasks.length;

  factory KyaLesson.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return KyaLesson(
      title: '',
      imageUrl: '',
      id: id,
      tasks: const [],
      status: KyaLessonStatus.todo,
      completionMessage: '',
      shareLink: '',
    );
  }

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);

  KyaLesson copyWith({String? shareLink, KyaLessonStatus? status}) {
    return KyaLesson(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      tasks: tasks,
      status: status ?? this.status,
      shareLink: shareLink ?? this.shareLink,
    );
  }

  String get shareLinkParams => 'kyaId=$id';

  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  @override
  List<Object> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class KyaTask extends Equatable {
  const KyaTask({
    required this.title,
    required this.imageUrl,
    required this.status,
    required this.body,
    required this.id,
  });

  KyaTask copyWith({KyaTaskStatus? status}) {
    return KyaTask(
      title: title,
      imageUrl: imageUrl,
      status: status ?? this.status,
      body: body,
      id: id,
    );
  }

  Map<String, dynamic> toUserProgressJson() => {"id": id, "status": status};

  factory KyaTask.fromJson(Map<String, dynamic> json) =>
      _$KyaTaskFromJson(json);

  final String id;

  final String title;

  @JsonKey(name: 'image_url')
  final String imageUrl;

  final String body;

  @JsonKey(defaultValue: KyaTaskStatus.todo)
  final KyaTaskStatus status;

  Map<String, dynamic> toJson() => _$KyaTaskToJson(this);

  String imageUrlCacheKey(KyaLesson kya) {
    return 'kya-${kya.id}-${kya.tasks.indexOf(this)}-lesson-image-url';
  }

  @override
  List<Object?> get props => [
        title,
        imageUrl,
        body,
        status,
        id,
      ];
}

@JsonSerializable(explicitToJson: true)
class KyaLessons {
  factory KyaLessons.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonsFromJson(json);

  KyaLessons({required this.lessons});

  List<KyaLesson> lessons;

  Map<String, dynamic> toJson() => _$KyaLessonsToJson(this);
}
