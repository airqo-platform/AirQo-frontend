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

  factory Kya.fromDbJson(List<Map<String, Object?>>? json) {
    if (json == null) {
      return Kya('', '', '', [], 0.0);
    }

    try {
      var singleKya = json.first;
      var kya = Kya(
          singleKya['title'] as String,
          singleKya['imageUrl'] as String,
          singleKya['id'] as String,
          [],
          singleKya['progress'] as double);

      var kyaItems = <KyaItem>[];
      for (var item in json) {
        var kyaItem = KyaItem(item['item_title'] as String,
            item['item_imageUrl'] as String, item['item_body'] as String);
        kyaItems.add(kyaItem);
      }

      kya.kyaItems = kyaItems;
      return kya;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      debugPrint(stackTrace.toString());
    }

    return Kya('', '', '', [], 0.0);
  }

  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  Map<String, dynamic> parseKyaToDb() {
    try {
      var kyaItems = this.kyaItems;
      var kyaJson = toJson()..remove('kyaItems');

      for (var item in kyaItems) {
        var itemJson = {
          'item_title': item.title,
          'item_imageUrl': item.imageUrl,
          'item_body': item.body,
        };
        kyaJson.addAll(itemJson);
      }
      return kyaJson;
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      debugPrint(stackTrace.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return {};
  }

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'id TEXT PRIMARY KEY, progress REAL, title TEXT, imageUrl TEXT,'
      'item_title TEXT, item_imageUrl TEXT, item_body TEXT)';

  static String dbName() => 'kya_db';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static Kya? parseKya(dynamic jsonBody) {
    try {
      return Kya.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      debugPrint(exception.toString());
      debugPrint(stackTrace.toString());
      Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
    return null;
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
}
