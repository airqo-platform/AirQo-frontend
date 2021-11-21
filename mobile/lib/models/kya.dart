import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
class Kya {
  @JsonKey(defaultValue: 0.0)
  double progress;
  String title;
  String imageUrl;
  String id;
  List<KyaItem> kyaItems = [];

  Kya(this.title, this.imageUrl, this.id, this.kyaItems, this.progress);

  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id TEXT PRIMARY KEY, progress REAL, '
      'title TEXT, imageUrl TEXT)';

  static String dbName() => 'kya_db';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static Kya? parseKya(dynamic jsonBody) {
    try {
      return Kya.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
  }

  static Map<String, dynamic> parseKyaToDb(Kya kya) {
    try {
      return kya.toJson().remove('kyaItems');
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return {};
  }
}

@JsonSerializable(explicitToJson: true)
class KyaItem {
  String title;
  String imageUrl;
  String body;

  KyaItem(this.title, this.imageUrl, this.body);

  factory KyaItem.fromJson(Map<String, dynamic> json) =>
      _$KyaItemFromJson(json);

  Map<String, dynamic> toJson() => _$KyaItemToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, '
      'body TEXT, parentId TEXT, title TEXT, imageUrl TEXT)';

  static String dbName() => 'kya_items_db';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<Map<String, dynamic>> parseKyaItemsToDb(Kya kya) {
    try {
      var kyaJson = kya.toJson()['kyaItems'];
      var parentId = kya.id;
      var itemsJson = <Map<String, dynamic>>[];

      for (var item in kyaJson) {
        item['parentId'] = parentId;
        itemsJson.add(item);
      }
      return itemsJson;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return [{}];
  }
}
