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
    required this.secondaryImageUrl,
    required this.shareLink,
  });

  final String title;

  @JsonKey(defaultValue: 'You just finished your first Know You Air Lesson')
  final String completionMessage;

  final String imageUrl;

  @JsonKey(defaultValue: '')
  final String secondaryImageUrl;

  final String id;

  final List<KyaLesson> lessons;

  @JsonKey(defaultValue: 0)
  final double progress;

  // Example: https://storage.googleapis.com/airqo_open_data/hero_image.jpeg
  @JsonKey(defaultValue: '')
  final String shareLink;

  factory Kya.fromDynamicLink(PendingDynamicLinkData dynamicLinkData) {
    final String id = dynamicLinkData.link.queryParameters['kyaId'] ?? '';

    return Kya(
      title: '',
      imageUrl: '',
      id: id,
      lessons: const [],
      progress: 0,
      completionMessage: '',
      secondaryImageUrl: '',
      shareLink: '',
    );
  }

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  Kya copyWith({String? shareLink, double? progress}) {
    return Kya(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      secondaryImageUrl: secondaryImageUrl,
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
  List<Object> get props => [id];
}

@JsonSerializable(explicitToJson: true)
class KyaLesson extends Equatable {
  const KyaLesson({
    required this.title,
    required this.imageUrl,
    required this.body,
  });

  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  final String title;

  final String imageUrl;

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
    required this.id,
    required this.progress,
  });

  factory KyaProgress.fromJson(Map<String, dynamic> json) =>
      _$KyaProgressFromJson(json);

  factory KyaProgress.fromKya(Kya kya) => KyaProgress(
        id: kya.id,
        progress: kya.progress,
      );

  KyaProgress copyWith({double? progress}) {
    return KyaProgress(
      id: id,
      progress: progress ?? this.progress,
    );
  }

  final String id;
  final double progress;

  Map<String, dynamic> toJson() => _$KyaProgressToJson(this);
}
