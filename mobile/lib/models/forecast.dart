import 'package:app/models/parsers.dart';
import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

import 'enum_constants.dart';
import 'health_tip.dart';
import 'hive_type_id.dart';

part 'forecast.g.dart';

@HiveType(typeId: forecastTypeId)
@JsonSerializable(createToJson: false)
class Forecast extends HiveObject with EquatableMixin {
  Forecast({
    required this.siteId,
    required this.pm2_5,
    required this.time,
    required this.message,
    required this.healthTips,
  });

  factory Forecast.fromJson(Map<String, dynamic> json) =>
      _$ForecastFromJson(json);

  factory Forecast.fromAPI(Map<String, dynamic> json, String siteId) {
    Forecast forecast = Forecast.fromJson(json);

    return forecast.copyWith(siteId: siteId);
  }

  Forecast copyWith({String? siteId}) {
    return Forecast(
      siteId: siteId ?? this.siteId,
      pm2_5: pm2_5,
      message: message,
      time: time,
      healthTips: healthTips,
    );
  }

  @HiveField(0)
  @JsonKey(
    fromJson: dateTimeFromUtcString,
    toJson: dateTimeToUtcString,
  )
  final DateTime time;

  @HiveField(1)
  @JsonKey()
  final double pm2_5;

  @HiveField(2)
  @JsonKey(defaultValue: "")
  final String siteId;

  @HiveField(3)
  @JsonKey(defaultValue: "")
  final String message;

  String get tempMessage =>
      "Expect conditions to be ${Pollutant.pm2_5.airQuality(pm2_5).title}";

  @HiveField(4, defaultValue: [])
  @JsonKey(defaultValue: [], name: "health_tips")
  final List<HealthTip> healthTips;

  AirQuality get airQuality => Pollutant.pm2_5.airQuality(pm2_5);

  @override
  List<Object?> get props => [
        siteId,
        time,
        pm2_5,
        healthTips,
      ];
}
