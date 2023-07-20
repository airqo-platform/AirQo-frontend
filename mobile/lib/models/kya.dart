import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:json_annotation/json_annotation.dart';

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
    required this.progress,
    required this.completionMessage,
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

  // Example: https://storage.googleapis.com/airqo_open_data/hero_image.jpeg
  @JsonKey(defaultValue: '')
  final String? shareLink;

  @JsonKey(defaultValue: 0, name: 'kya_user_progress')
  final double progress;

  factory KyaLesson.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return KyaLesson(
      title: '',
      imageUrl: '',
      id: id,
      tasks: const [],
      completionMessage: '',
      shareLink: '',
      progress: 0,
    );
  }

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);

  KyaLesson copyWith({String? shareLink, double? progress}) {
    return KyaLesson(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      tasks: tasks,
      progress: progress ?? this.progress,
      shareLink: shareLink ?? this.shareLink,
    );
  }

  String shareLinkParams() {
    return 'kyaId=$id';
  }

  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  String secondaryImageUrlCacheKey() {
    return 'kya-$id-secondary-image_url';
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

  factory KyaTask.fromKya(KyaLesson kya, int index) {
    return KyaTask(
      id: kya.tasks[index].id,
      title: kya.tasks[index].title,
      imageUrl: kya.tasks[index].imageUrl,
      content: kya.tasks[index].content,
    );
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
  List<Object?> get props => [
        title,
        imageUrl,
        content,
      ];
}

@JsonSerializable()
class KyaProgress {
  const KyaProgress({
    required this.progress,
    required this.kyaId,
    this.id,
  });

  factory KyaProgress.fromJson(Map<String, dynamic> json) =>
      _$KyaProgressFromJson(json);

  factory KyaProgress.fromKya(KyaLesson kya) => KyaProgress(
        progress: kya.progress,
        kyaId: kya.id,
      );

  KyaProgress copyWith({double? progress}) {
    return KyaProgress(
      id: id,
      progress: progress ?? this.progress,
      kyaId: kyaId,
    );
  }

  @JsonKey(name: '_id')
  final String? id;

  @JsonKey(defaultValue: 0)
  final double progress;

  @JsonKey(name: 'lesson_id')
  final String kyaId;

  Map<String, dynamic> toJson() => _$KyaProgressToJson(this);
}

@JsonSerializable(explicitToJson: true)
class KyaList {
  factory KyaList.fromJson(Map<String, dynamic> json) =>
      _$KyaListFromJson(json);

  KyaList({required this.data});

  List<KyaLesson> data;

  Map<String, dynamic> toJson() => _$KyaListToJson(this);
}
