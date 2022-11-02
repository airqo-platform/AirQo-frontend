import 'package:app/models/place_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/utils/exception.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:uuid/uuid.dart';

import '../services/hive_service.dart';

part 'analytics.g.dart';

@JsonSerializable()
@HiveType(typeId: 40, adapterName: 'AnalyticsAdapter')
class Analytics extends HiveObject {
  factory Analytics.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsFromJson(json);

  Analytics({
    required this.id,
    required this.site,
    required this.name,
    required this.location,
    required this.createdAt,
    required this.longitude,
    required this.latitude,
  });

  @HiveField(1)
  String id;

  @HiveField(2, defaultValue: '')
  String site;

  @HiveField(3, defaultValue: '')
  String name;

  @HiveField(4, defaultValue: '')
  String location;

  @HiveField(5)
  double latitude;

  @HiveField(6)
  double longitude;

  @HiveField(7)
  DateTime createdAt;

  Map<String, dynamic> toJson() => _$AnalyticsToJson(this);

  static Analytics init() {
    return Analytics(
      id: const Uuid().v4(),
      site: '',
      name: '',
      location: '',
      latitude: 0.0,
      longitude: 0.0,
      createdAt: DateTime.now().toUtc(),
    );
  }

  PlaceDetails toPlaceDetails() {
    return PlaceDetails(
      name: name,
      location: location,
      siteId: site,
      placeId: id,
      latitude: latitude,
      longitude: longitude,
    );
  }

  Future<void> add() async {
    final analytics = Hive.box<Analytics>(HiveBox.analytics).values
      ..where((element) => element.site == site).toList();
    if (analytics.isEmpty) {
      await Hive.box<Analytics>(HiveBox.analytics)
          .put(site, this)
          .then((value) => CloudStore.updateCloudAnalytics());
      // TODO send notification
    }
  }

  static Analytics? parseAnalytics(Map<String, dynamic> jsonBody) {
    try {
      return Analytics.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      logException(exception, stackTrace);

      return null;
    }
  }

  static List<Analytics> sort(List<Analytics> analytics) {
    analytics.sort(
      (x, y) {
        return -(x.createdAt.compareTo(y.createdAt));
      },
    );

    return analytics;
  }

  static Future<void> load(List<Analytics> analytics) async {
    final newAnalytics = <dynamic, Analytics>{};

    for (final analytic in analytics) {
      newAnalytics[analytic.site] = analytic;
    }

    await Hive.box<Analytics>(HiveBox.analytics).putAll(newAnalytics);
  }
}
