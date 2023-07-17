import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:json_annotation/json_annotation.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
class Kya extends Equatable {
  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  const Kya({
    required this.title,
    required this.imageUrl,
    required this.id,
    required this.lessons,
    required this.progress,
    required this.completionMessage,
    this.shareLink,
  });

  final String title;

  @JsonKey(
      defaultValue: 'You just finished your first Know You Air Lesson',
      name: 'completion_message')
  final String completionMessage;

  @JsonKey(name: 'image')
  final String imageUrl;

  @JsonKey(name: '_id')
  final String id;

  @JsonKey(name: 'tasks')
  final List<KyaLesson> lessons;

  // Example: https://storage.googleapis.com/airqo_open_data/hero_image.jpeg
  @JsonKey(defaultValue: '')
  final String? shareLink;

  @JsonKey(defaultValue: 0)
  final double progress;

  factory Kya.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return Kya(
      title: '',
      imageUrl: '',
      id: id,
      lessons: const [],
      completionMessage: '',
      shareLink: '',
      progress: 0,
    );
  }

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  Kya copyWith({String? shareLink, double? progress}) {
    return Kya(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      id: id,
      lessons: lessons,
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
  List<Object> get props => [id, title, progress];
}

@JsonSerializable(explicitToJson: true)
class KyaLesson extends Equatable {
  const KyaLesson({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.body,
  });

  factory KyaLesson.fromJson(Map<String, dynamic> json) {
    return _$KyaLessonFromJson(json);
  }

  factory KyaLesson.fromKya(Kya kya, int index) {
    return KyaLesson(
      id: kya.lessons[index].id,
      title: kya.lessons[index].title,
      imageUrl: kya.lessons[index].imageUrl,
      body: kya.lessons[index].body,
    );
  }

  @JsonKey(name: '_id')
  final String id;

  final String title;

  @JsonKey(name: 'image')
  final String imageUrl;

  @JsonKey(name: 'content')
  final String body;

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);

  String imageUrlCacheKey(Kya kya) {
    return 'kya-${kya.id}-${kya.lessons.indexOf(this)}-lesson-image-url';
  }

  @override
  List<Object?> get props => [
        title,
        imageUrl,
        body,
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

  factory KyaProgress.fromKya(Kya kya) => KyaProgress(
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

  List<Kya> data;

  Map<String, dynamic> toJson() => _$KyaListToJson(this);
}
