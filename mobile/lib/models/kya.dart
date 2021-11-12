import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

part 'kya.g.dart';

@JsonSerializable(explicitToJson: true)
class Kya {
  String title;
  String imageUrl;
  String id;
  List<KyaItem> kyaItems = [];

  @JsonKey(defaultValue: 0.0)
  double progress;

  Kya(this.title, this.imageUrl, this.id, this.kyaItems, this.progress);

  factory Kya.fromJson(Map<String, dynamic> json) => _$KyaFromJson(json);

  Map<String, dynamic> toJson() => _$KyaToJson(this);

  static List<Map<String, dynamic>> listToJson(List<Kya> kyas) {
    var kyasJson = <Map<String, dynamic>>[];
    for (var kya in kyas) {
      try {
        var placeJson = kya.toJson();
        kyasJson.add(placeJson);
      } catch (exception, stackTrace) {
        debugPrint(exception.toString());
        Sentry.captureException(
          exception,
          stackTrace: stackTrace,
        );
      }
    }
    return kyasJson;
  }

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
}

@JsonSerializable()
class KyaItem {
  String title;
  String imageUrl;
  String body;

  @JsonKey(defaultValue: false)
  bool viewed;

  KyaItem(this.title, this.imageUrl, this.body, this.viewed);

  factory KyaItem.fromJson(Map<String, dynamic> json) =>
      _$KyaItemFromJson(json);

  Map<String, dynamic> toJson() => _$KyaItemToJson(this);
}
