import 'package:app/services/firebase_service.dart';
import 'package:flutter/cupertino.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import '../constants/config.dart';
import 'enum_constants.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 30, adapterName: 'KyaAdapter')
class Kya extends HiveObject {
  factory Kya.fromDbJson(List<Map<String, Object?>>? json) {
    if (json == null) {
      return Kya(
          title: '',
          id: '',
          imageUrl: '',
          completionMessage: '',
          lessons: [],
          progress: 0,
          secondaryImageUrl: '');
    }

    try {
      var singleKya = json.first;
      var kya = Kya(
        title: singleKya['title'] as String,
        imageUrl: singleKya['imageUrl'] as String,
        id: singleKya['id'] as String,
        lessons: [],
        progress: singleKya['progress'] as int,
        completionMessage: singleKya['completionMessage'] as String,
        secondaryImageUrl: singleKya['secondaryImageUrl'] as String,
      );

      var kyaLessons = <KyaLesson>[];
      for (var item in json) {
        var kyaItem = KyaLesson(item['lesson_title'] as String,
            item['lesson_imageUrl'] as String, item['lesson_body'] as String);
        kyaLessons.add(kyaItem);
      }

      kya.lessons = kyaLessons;
      return kya;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }

    return Kya(
        title: '',
        id: '',
        imageUrl: '',
        completionMessage: '',
        lessons: [],
        progress: 0,
        secondaryImageUrl: '');
  }

  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  Kya(
      {required this.title,
      required this.imageUrl,
      required this.id,
      required this.lessons,
      required this.progress,
      required this.completionMessage,
      required this.secondaryImageUrl});

  @HiveField(1, defaultValue: 0)
  @JsonKey(defaultValue: 0)
  int progress;

  @HiveField(2)
  String title;

  @HiveField(3,
      defaultValue: 'You just finished your first Know You Air Lesson')
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
        Hive.box<Kya>(HiveBox.kya)
            .put(id, this)
            .then((_) => CloudStore.updateKyaProgress(this)),
        CloudAnalytics.logEvent(AnalyticsEvent.completeOneKYA)
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

    for (var kya in kyas) {
      newKyas[kya.id] = kya;
    }

    await Hive.box<Kya>(HiveBox.kya).putAll(newKyas);
  }
}

@JsonSerializable(explicitToJson: true)
@HiveType(typeId: 130, adapterName: 'KyaLessonAdapter')
class KyaLesson {
  KyaLesson(this.title, this.imageUrl, this.body);

  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  @HiveField(0)
  String title;

  @HiveField(1)
  String imageUrl;

  @HiveField(2)
  String body;

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserKya {
  factory UserKya.fromJson(Map<String, dynamic> json) =>
      _$UserKyaFromJson(json);

  UserKya(this.id, this.progress);
  @JsonKey(defaultValue: 0)
  int progress;
  String id;

  Map<String, dynamic> toJson() => _$UserKyaToJson(this);
}
