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

  @JsonKey(defaultValue: 'You just finished your first Know Your Air Lesson')
  final String completionMessage;

  final String imageUrl;

  final String id;

  @JsonKey(defaultValue: [])
  final List<KyaTask> tasks;

  @JsonKey(defaultValue: KyaLessonStatus.todo)
  final KyaLessonStatus status;

  // Example: https://storage.googleapis.com/airqo_open_data/hero_image.jpeg
  @JsonKey(defaultValue: '')
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

  KyaLesson copyFromKyaUserLesson(KyaUserLesson kyaUserLesson) {
    List<KyaTask> tasks = List.of(this.tasks).map((task) {
      KyaUserTask kyaUserLessonTask = kyaUserLesson.tasks.firstWhere(
          (element) => element.id == task.id,
          orElse: () => KyaUserTask(id: task.id, status: KyaTaskStatus.todo));
      return task.copyWith(status: kyaUserLessonTask.status);
    }).toList();

    return KyaLesson(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      tasks: tasks,
      status: kyaUserLesson.status,
      shareLink: shareLink,
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
class KyaLessonsList {
  factory KyaLessonsList.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonsListFromJson(json);

  KyaLessonsList({required this.lessons});

  List<KyaLesson> lessons;

  Map<String, dynamic> toJson() => _$KyaLessonsListToJson(this);
}

@JsonSerializable(explicitToJson: true)
class KyaUserLesson extends Equatable {
  factory KyaUserLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaUserLessonFromJson(json);

  factory KyaUserLesson.fromKyaLesson(KyaLesson lesson) => KyaUserLesson(
        id: lesson.id,
        status: lesson.status,
        tasks:
            lesson.tasks.map((task) => KyaUserTask.fromKyaTask(task)).toList(),
      );

  const KyaUserLesson({
    required this.id,
    required this.tasks,
    required this.status,
  });

  final String id;

  final List<KyaUserTask> tasks;

  @JsonKey(defaultValue: KyaLessonStatus.todo)
  final KyaLessonStatus status;

  Map<String, dynamic> toJson() => _$KyaUserLessonToJson(this);

  @override
  List<Object?> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class KyaUserTask extends Equatable {
  const KyaUserTask({
    required this.status,
    required this.id,
  });

  KyaUserTask copyWith({KyaTaskStatus? status}) {
    return KyaUserTask(
      status: status ?? this.status,
      id: id,
    );
  }

  factory KyaUserTask.fromJson(Map<String, dynamic> json) =>
      _$KyaUserTaskFromJson(json);

  factory KyaUserTask.fromKyaTask(KyaTask task) => KyaUserTask(
        id: task.id,
        status: task.status,
      );

  @JsonKey(defaultValue: "")
  final String id;

  @JsonKey(defaultValue: KyaTaskStatus.todo)
  final KyaTaskStatus status;

  Map<String, dynamic> toJson() => _$KyaUserTaskToJson(this);

  @override
  List<Object?> get props => [
        id,
      ];
}
