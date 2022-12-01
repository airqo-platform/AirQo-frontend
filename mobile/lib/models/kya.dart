import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 30, adapterName: 'KyaAdapter')
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

  @HiveField(1, defaultValue: 0)
  @JsonKey(defaultValue: 0)
  int progress;

  @HiveField(2)
  String title;

  @HiveField(
    3,
    defaultValue: 'You just finished your first Know You Air Lesson',
  )
  @JsonKey(defaultValue: 'You just finished your first Know You Air Lesson')
  String completionMessage;

  @HiveField(4)
  String imageUrl;

  @HiveField(5)
  @JsonKey(defaultValue: '')
  String secondaryImageUrl;

  @HiveField(6)
  String id;

  @HiveField(7)
  List<KyaLesson> lessons = [];

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
@HiveType(typeId: 130, adapterName: 'KyaLessonAdapter')
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
