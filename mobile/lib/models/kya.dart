import 'package:app/services/firebase_service.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import '../services/hive_service.dart';
import '../services/native_api.dart';
import 'enum_constants.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 30, adapterName: 'KyaAdapter')
class Kya extends HiveObject {
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

  Future<void> saveKya() async {
    if (progress == lessons.length) {
      await Future.wait([
        Hive.box<Kya>(HiveBox.kya).put(id, this).then(
              (_) => CloudStore.updateKyaProgress(this),
            ),
        CloudAnalytics.logEvent(
          AnalyticsEvent.completeOneKYA,
        ),
      ]);
    } else {
      await Hive.box<Kya>(HiveBox.kya)
          .put(id, this)
          .then((_) => CloudStore.updateKyaProgress(this));
    }
  }

  static Future<void> load(List<Kya> kyas) async {
    await Hive.box<Kya>(HiveBox.kya).clear();
    final newKyas = <dynamic, Kya>{};

    for (final kya in kyas) {
      newKyas[kya.id] = kya;
    }

    await Hive.box<Kya>(HiveBox.kya).putAll(newKyas);

    for (final kya in kyas) {
      await CacheService.cacheKyaImages(kya);
    }
  }

  static Future<List<Kya>> getIncompleteKya() async {
    return Hive.box<Kya>(HiveBox.kya).values.where((element) {
      return element.progress != -1;
    }).toList();
  }

  String imageUrlCacheKey() {
    return 'kya-$id-image-url';
  }

  String secondaryImageUrlCacheKey() {
    return 'kya-$id-secondary-image_url';
  }
}

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 130, adapterName: 'KyaLessonAdapter')
class KyaLesson {
  KyaLesson(
    this.title,
    this.imageUrl,
    this.body,
  );

  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  @HiveField(0)
  String title;

  @HiveField(1)
  String imageUrl;

  @HiveField(2)
  String body;

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);

  String imageUrlCacheKey(Kya kya) {
    return 'kya-${kya.id}-${kya.lessons.indexOf(this)}-lesson-image-url';
  }
}

@JsonSerializable(explicitToJson: true)
class UserKya {
  factory UserKya.fromJson(Map<String, dynamic> json) =>
      _$UserKyaFromJson(json);

  UserKya(
    this.id,
    this.progress,
  );
  @JsonKey(defaultValue: 0)
  int progress;
  String id;

  Map<String, dynamic> toJson() => _$UserKyaToJson(this);
}

