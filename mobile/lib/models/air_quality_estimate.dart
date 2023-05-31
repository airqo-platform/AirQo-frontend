import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';
import 'health_tip.dart';
import 'json_parsers.dart';

part 'air_quality_estimate.g.dart';

@JsonSerializable(createToJson: false)
class AirQualityEstimate {
  AirQualityEstimate({
    required this.pm2_5,
    required this.time,
    required this.healthTips,
  });

  factory AirQualityEstimate.fromJson(Map<String, dynamic> json) =>
      _$AirQualityEstimateFromJson(json);

  @JsonKey(
    fromJson: dateTimeFromUtcString,
    toJson: dateTimeToUtcString,
    name: "timestamp",
  )
  final DateTime time;
  final double pm2_5;

  @JsonKey(defaultValue: [], name: "health_tips")
  final List<HealthTip> healthTips;

  AirQuality get airQuality => Pollutant.pm2_5.airQuality(pm2_5);
}
