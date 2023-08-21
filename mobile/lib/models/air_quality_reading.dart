import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_dynamic_links/firebase_dynamic_links.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'hive_type_id.dart';

part 'air_quality_reading.g.dart';

@HiveType(typeId: airQualityReadingTypeId)
class AirQualityReading extends HiveObject with EquatableMixin {
  AirQualityReading({
    required this.referenceSite,
    required this.dataProvider,
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
    required this.shareLink,
    required this.healthTips,
  });

  factory AirQualityReading.fromAPI(Map<String, dynamic> json) {
    DateTime dateTime = dateTimeFromUtcString(json["time"]);
    PollutantValue pm2_5 =
        PollutantValue.fromJson(json["pm2_5"] as Map<String, dynamic>);
    PollutantValue pm10 =
        PollutantValue.fromJson(json["pm10"] as Map<String, dynamic>);

    Site site = Site.fromJson(json["siteDetails"] as Map<String, dynamic>);

    if (pm2_5.displayValue() == null) {
      throw Exception("pm2.5 is null for site ${site.getName()}");
    }
    List<HealthTip> healthTips = [];
    dynamic jsonHealthTips = json['health_tips'];

    if (jsonHealthTips != null) {
      for (final healthTip in jsonHealthTips as List<dynamic>) {
        try {
          healthTips.add(HealthTip.fromJson(healthTip as Map<String, dynamic>));
        } catch (_, __) {}
      }
    }

    return AirQualityReading(
      distanceToReferenceSite: 0.0,
      dateTime: dateTime,
      placeId: site.id,
      referenceSite: site.id,
      latitude: site.latitude,
      longitude: site.longitude,
      country: site.country,
      region: site.region,
      dataProvider: site.dataProvider,
      pm2_5: pm2_5.displayValue()!,
      pm10: pm10.displayValue(),
      name: site.getName(),
      location: site.getLocation(),
      shareLink: site.getShareLink(),
      healthTips: healthTips,
    );
  }

  factory AirQualityReading.fromDynamicLink(
    PendingDynamicLinkData dynamicLinkData,
  ) {
    String referenceSite =
        dynamicLinkData.link.queryParameters['referenceSite'] ?? '';
    String placeId = dynamicLinkData.link.queryParameters['placeId'] ?? '';
    String name = dynamicLinkData.link.queryParameters['name'] ?? '';
    String location = dynamicLinkData.link.queryParameters['location'] ?? '';
    String latitude = dynamicLinkData.link.queryParameters['latitude'] ?? '0.0';
    String longitude =
        dynamicLinkData.link.queryParameters['longitude'] ?? '0.0';

    AirQualityReading airQualityReading =
        HiveService().getAirQualityReadings().firstWhere(
      (element) => element.referenceSite == referenceSite,
      orElse: () {
        String country = dynamicLinkData.link.queryParameters['country'] ?? '';
        String dataProvider =
            dynamicLinkData.link.queryParameters['dataProvider'] ?? '';
        String shareLink =
            dynamicLinkData.link.queryParameters['shareLink'] ?? '';
        String region = dynamicLinkData.link.queryParameters['region'] ?? '';
        String distanceToReferenceSite =
            dynamicLinkData.link.queryParameters['distanceToReferenceSite'] ??
                '';

        return AirQualityReading(
          referenceSite: referenceSite,
          dataProvider: dataProvider,
          latitude: latitude as double,
          longitude: longitude as double,
          country: country,
          name: name,
          location: location,
          region: region,
          dateTime: DateTime.now(),
          pm2_5: 0.0,
          pm10: 0.0,
          distanceToReferenceSite: distanceToReferenceSite as double,
          placeId: placeId,
          shareLink: shareLink,
          healthTips: [],
        );
      },
    );

    return airQualityReading.copyWith(
      placeId: placeId,
      name: name,
      location: location,
      latitude: double.parse(latitude),
      longitude: double.parse(longitude),
    );
  }

  String shareLinkParams() {
    return 'placeId=$placeId'
        '&referenceSite=$referenceSite'
        '&name=$name'
        '&location=$location'
        '&latitude=$latitude'
        '&longitude=$longitude'
        '&country=$country'
        '&dataProvider=$dataProvider'
        '&distanceToReferenceSite=$distanceToReferenceSite'
        '&region=$region';
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
    String? shareLink,
    List<HealthTip>? healthTips,
  }) {
    return AirQualityReading(
      referenceSite: referenceSite ?? this.referenceSite,
      dataProvider: dataProvider,
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
      shareLink: shareLink ?? this.shareLink,
      healthTips: healthTips ?? this.healthTips,
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
  final String dataProvider;

  @HiveField(6, defaultValue: '')
  final String location;

  @HiveField(8)
  final DateTime dateTime;

  @HiveField(9)
  final double pm2_5;

  @HiveField(10)
  final double? pm10;

  @HiveField(11, defaultValue: 0.0)
  final double distanceToReferenceSite;

  @HiveField(12, defaultValue: '')
  final String placeId;

  @HiveField(13, defaultValue: '')
  final String region;

  @HiveField(14, defaultValue: '')
  final String shareLink;

  @HiveField(15, defaultValue: [])
  final List<HealthTip> healthTips;

  AirQuality get airQuality => Pollutant.pm2_5.airQuality(pm2_5);

  @override
  List<Object> get props => [name, dateTime];
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
  final double? value;

  double? displayValue() {
    return calibratedValue ?? value;
  }

  static double? _valueFromJson(dynamic json) {
    return json == null
        ? null
        : double.parse(double.parse("$json").toStringAsFixed(2));
  }
}

@JsonSerializable(createToJson: false)
class Site {
  factory Site.fromJson(Map<String, dynamic> json) => _$SiteFromJson(json);

  const Site({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.name,
    required this.description,
    required this.searchName,
    required this.searchLocation,
    required this.country,
    required this.region,
    required this.dataProvider,
    required this.shareLinks,
  });

  @JsonKey(required: true, name: '_id')
  final String id;

  @JsonKey(required: true, name: 'approximate_latitude')
  final double latitude;

  @JsonKey(required: true, name: 'approximate_longitude')
  final double longitude;

  @JsonKey(required: true)
  final String name;

  @JsonKey(required: true)
  final String description;

  @JsonKey(required: false, defaultValue: '', name: 'search_name')
  final String searchName;

  @JsonKey(required: false, defaultValue: '', name: 'location_name')
  final String searchLocation;

  @JsonKey(required: false, defaultValue: '')
  final String country;

  @JsonKey(required: false, defaultValue: '')
  final String region;

  @JsonKey(required: false, defaultValue: '', name: 'data_provider')
  final String dataProvider;

  @JsonKey(required: false, defaultValue: {}, name: "share_links")
  final Map<String, dynamic> shareLinks;

  String getName() {
    return searchName.isEmpty ? name : searchName;
  }

  String getLocation() {
    return searchLocation.isEmpty ? description : searchLocation;
  }

  String getShareLink() {
    return (shareLinks["short_link"] ?? "") as String;
  }
}
