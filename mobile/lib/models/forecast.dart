import 'package:equatable/equatable.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

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
      time: time,
      healthTips: healthTips,
    );
  }

  @HiveField(0)
  @JsonKey()
  final DateTime time;

  @HiveField(1)
  @JsonKey()
  final double pm2_5;

  @HiveField(2)
  @JsonKey(defaultValue: "")
  final String siteId;

  @HiveField(3, defaultValue: [])
  final List<HealthTip> healthTips;

  @override
  List<Object?> get props => [
        siteId,
        time,
        pm2_5,
        healthTips,
      ];
}
