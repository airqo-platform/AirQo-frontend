import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'hive_type_id.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: kyaTypeId)
class Kya extends HiveObject with EquatableMixin {
  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  Kya({
    required this.title,
    required this.imageUrl,
    required this.id,
    required this.lessons,
    required this.progress,
    required this.completionMessage,
    required this.secondaryImageUrl,
  });

  @HiveField(2)
  final String title;

  @HiveField(
    3,
    defaultValue: 'You just finished your first Know You Air Lesson',
  )
  @JsonKey(defaultValue: 'You just finished your first Know You Air Lesson')
  final String completionMessage;

  @HiveField(4)
  final String imageUrl;

  @HiveField(5)
  @JsonKey(defaultValue: '')
  final String secondaryImageUrl;

  @HiveField(6)
  final String id;

  @HiveField(7)
  final List<KyaLesson> lessons;

  @HiveField(8, defaultValue: 0)
  @JsonKey(defaultValue: 0)
  final double progress;

  Kya copyWith({double? progress}) {
    return Kya(
      title: title,
      completionMessage: completionMessage,
      imageUrl: imageUrl,
      secondaryImageUrl: secondaryImageUrl,
      id: id,
      lessons: lessons,
      progress: progress ?? this.progress,
    );
  }

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  String secondaryImageUrlCacheKey() {
    return 'kya-$id-secondary-image_url';
  }

  @override
  List<Object?> get props => [
        progress,
        title,
        completionMessage,
        lessons,
        id,
        secondaryImageUrl,
        imageUrl,
      ];
}

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: kyaLessonTypeId)
class KyaLesson extends Equatable {
  const KyaLesson({
    required this.title,
    required this.imageUrl,
    required this.body,
  });

  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  @HiveField(0)
  final String title;

  @HiveField(1)
  final String imageUrl;

  @HiveField(2)
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

  final String id;
  final double progress;

  Map<String, dynamic> toJson() => _$KyaProgressToJson(this);
}
