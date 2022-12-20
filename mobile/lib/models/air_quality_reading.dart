import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app_repository/app_repository.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'hive_type_id.dart';

part 'air_quality_reading.g.dart';

@JsonSerializable()
@HiveType(typeId: airQualityReadingTypeId)
class AirQualityReading extends HiveObject {
  AirQualityReading({
    required this.referenceSite,
    required this.source,
    required this.latitude,
    required this.longitude,
    required this.country,
    required this.name,
    required this.location,
    required this.region,
    required this.dateTime,
    required this.pm2_5,
    required this.pm10,
    required this.distanceToReferenceSite,
    required this.placeId,
  });

  factory AirQualityReading.fromJson(Map<String, dynamic> json) =>
      _$AirQualityReadingFromJson(json);

  factory AirQualityReading.fromSiteReading(SiteReading siteReading) {
    return AirQualityReading(
      referenceSite: siteReading.siteId,
      latitude: siteReading.latitude,
      longitude: siteReading.longitude,
      country: siteReading.country,
      name: siteReading.name,
      location: siteReading.location,
      region: siteReading.region,
      source: siteReading.source,
      dateTime: siteReading.dateTime,
      pm2_5: siteReading.pm2_5,
      pm10: siteReading.pm10,
      distanceToReferenceSite: 0.0,
      placeId: siteReading.siteId,
    );
  }

  factory AirQualityReading.fromFavouritePlace(FavouritePlace favouritePlace) {
    AirQualityReading airQualityReading = Hive.box<AirQualityReading>(
            HiveBox.airQualityReadings)
        .values
        .firstWhere(
            (element) => element.referenceSite == favouritePlace.referenceSite,
            orElse: () {
      return AirQualityReading(
        referenceSite: favouritePlace.referenceSite,
        source: '',
        latitude: favouritePlace.latitude,
        longitude: favouritePlace.longitude,
        country: '',
        name: favouritePlace.name,
        location: favouritePlace.location,
        region: '',
        dateTime: DateTime.now(),
        pm2_5: 0,
        pm10: 0,
        distanceToReferenceSite: 0,
        placeId: favouritePlace.placeId,
      );
    });

    return airQualityReading.copyWith(
      referenceSite: favouritePlace.referenceSite,
      latitude: favouritePlace.latitude,
      longitude: favouritePlace.longitude,
      name: favouritePlace.name,
      location: favouritePlace.location,
      placeId: favouritePlace.placeId,
    );
  }

  AirQualityReading copyWith({
    double? distanceToReferenceSite,
    String? placeId,
    String? name,
    String? location,
    String? country,
    String? referenceSite,
    double? latitude,
    double? longitude,
    DateTime? dateTime,
    double? pm2_5,
    double? pm10,
  }) {
    return AirQualityReading(
      referenceSite: referenceSite ?? this.referenceSite,
      source: source,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      country: country ?? this.country,
      name: name ?? this.name,
      location: location ?? this.location,
      region: region,
      dateTime: dateTime ?? this.dateTime,
      pm2_5: pm2_5 ?? this.pm2_5,
      pm10: pm10 ?? this.pm10,
      distanceToReferenceSite:
          distanceToReferenceSite ?? this.distanceToReferenceSite,
      placeId: placeId ?? this.placeId,
    );
  }

  @HiveField(0, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String referenceSite;

  @HiveField(1)
  @JsonKey(defaultValue: 0.0)
  final double latitude;

  @HiveField(2)
  @JsonKey(defaultValue: 0.0)
  final double longitude;

  @HiveField(3, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String country;

  @HiveField(4, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String name;

  @HiveField(5, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String source;

  @HiveField(6, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String location;

  @HiveField(8)
  final DateTime dateTime;

  @HiveField(9, defaultValue: 0.0)
  @JsonKey(defaultValue: 0.0)
  final double pm2_5;

  @HiveField(10, defaultValue: 0.0)
  @JsonKey(defaultValue: 0.0)
  final double pm10;

  @HiveField(11, defaultValue: 0.0)
  @JsonKey(defaultValue: 0.0)
  final double distanceToReferenceSite;

  @HiveField(12, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String placeId;

  @HiveField(13, defaultValue: '')
  @JsonKey(defaultValue: '')
  final String region;

  Map<String, dynamic> toJson() => _$AirQualityReadingToJson(this);
}
