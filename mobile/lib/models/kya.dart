import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
class Kya {
  @JsonKey(defaultValue: 0)
  int progress;
  String title;
  @JsonKey(defaultValue: 'You just finished your first Know You Air Lesson')
  String completionMessage;
  String imageUrl;
  String id;
  List<KyaLesson> lessons = [];

  Kya(
      {required this.title,
      required this.imageUrl,
      required this.id,
      required this.lessons,
      required this.progress,
      required this.completionMessage});

  factory Kya.fromDbJson(List<Map<String, Object?>>? json) {
    if (json == null) {
      return Kya(
          title: '',
          id: '',
          imageUrl: '',
          completionMessage: '',
          lessons: [],
          progress: 0);
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
        progress: 0);
  }

  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  List<Map<String, dynamic>> parseKyaToDb() {
    try {
      var kyaLessons = lessons;
      var kyaJson = toJson()..remove('lessons');
      var kyaJsonList = <Map<String, dynamic>>[];

      for (var lesson in kyaLessons) {
        var lessonJson = <String, dynamic>{
          'lesson_title': lesson.title,
          'lesson_imageUrl': lesson.imageUrl,
          'lesson_body': lesson.body,
        };
        var jsonBody = lessonJson..addAll(kyaJson);
        kyaJsonList.add(jsonBody);
      }
      return kyaJsonList;
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return [];
  }

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'auto_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, id TEXT, '
      'progress INTEGER, title TEXT, completionMessage TEXT, imageUrl TEXT,'
      'lesson_title TEXT, lesson_imageUrl TEXT, lesson_body TEXT)';

  static String dbName() => 'kya_db';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static Kya? parseKya(dynamic jsonBody) {
    try {
      return Kya.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
  }
}

@JsonSerializable(explicitToJson: true)
class KyaLesson {
  String title;
  String imageUrl;
  String body;

  KyaLesson(this.title, this.imageUrl, this.body);

  factory KyaLesson.fromJson(Map<String, dynamic> json) =>
      _$KyaLessonFromJson(json);

  Map<String, dynamic> toJson() => _$KyaLessonToJson(this);
}

@JsonSerializable(explicitToJson: true)
class UserKya {
  @JsonKey(defaultValue: 0)
  int progress;
  String id;

  UserKya(this.id, this.progress);

  factory UserKya.fromJson(Map<String, dynamic> json) =>
      _$UserKyaFromJson(json);

  Map<String, dynamic> toJson() => _$UserKyaToJson(this);
}
