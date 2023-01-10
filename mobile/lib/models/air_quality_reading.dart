import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'hive_type_id.dart';

part 'air_quality_reading.g.dart';

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

  factory AirQualityReading.fromAPI(Map<String, dynamic> json) {
    DateTime dateTime = DateTime.parse(json["time"] as String);
    final int offSet = DateTime.now().timeZoneOffset.inHours;
    dateTime.add(Duration(hours: offSet));

    PollutantValue pm2_5 =
        PollutantValue.fromJson(json["pm2_5"] as Map<String, dynamic>);
    PollutantValue pm10 =
        PollutantValue.fromJson(json["pm10"] as Map<String, dynamic>);

    return AirQualityReading(
      distanceToReferenceSite: 0.0,
      dateTime: dateTime,
      pm2_5: pm2_5.calibratedValue ?? pm2_5.value,
      pm10: pm10.calibratedValue ?? pm10.value,
      placeId: json["siteDetails"]["_id"] as String,
      referenceSite: json["siteDetails"]["_id"] as String,
      latitude: json["siteDetails"]["approximate_latitude"] as double,
      longitude: json["siteDetails"]["approximate_longitude"] as double,
      country: json["siteDetails"]["country"] as String,
      name: (json["siteDetails"]["search_name"] ?? json["siteDetails"]["name"])
          as String,
      location: (json["siteDetails"]["location_name"] ??
          json["siteDetails"]["description"]) as String,
      region: json["siteDetails"]["region"] as String,
      source: json["siteDetails"]["network"] as String,
    );
  }

  factory AirQualityReading.fromFavouritePlace(FavouritePlace favouritePlace) {
    AirQualityReading airQualityReading = Hive.box<AirQualityReading>(
      HiveBox.airQualityReadings,
    ).values.firstWhere(
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
      },
    );

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
  final String referenceSite;

  @HiveField(1)
  final double latitude;

  @HiveField(2)
  final double longitude;

  @HiveField(3, defaultValue: '')
  final String country;

  @HiveField(4, defaultValue: '')
  final String name;

  @HiveField(5, defaultValue: '')
  final String source;

  @HiveField(6, defaultValue: '')
  final String location;

  @HiveField(8)
  final DateTime dateTime;

  @HiveField(9, defaultValue: 0.0)
  final double pm2_5;

  @HiveField(10, defaultValue: 0.0)
  final double pm10;

  @HiveField(11, defaultValue: 0.0)
  final double distanceToReferenceSite;

  @HiveField(12, defaultValue: '')
  final String placeId;

  @HiveField(13, defaultValue: '')
  final String region;
}

@JsonSerializable(createToJson: false)
class PollutantValue {
  factory PollutantValue.fromJson(Map<String, dynamic> json) =>
      _$PollutantValueFromJson(json);

  const PollutantValue({
    required this.value,
    required this.calibratedValue,
  });

  @JsonKey(
    required: false,
    name: 'calibratedValue',
    fromJson: _valueFromJson,
    includeIfNull: true,
  )
  final double? calibratedValue;

  @JsonKey(required: false, name: 'value', fromJson: _valueFromJson)
  final double value;

  static double _valueFromJson(double json) {
    return double.parse(json.toStringAsFixed(2));
  }
}
