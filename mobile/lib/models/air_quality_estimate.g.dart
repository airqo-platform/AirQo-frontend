// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'air_quality_estimate.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AirQualityEstimate _$AirQualityEstimateFromJson(Map<String, dynamic> json) =>
    AirQualityEstimate(
      pm2_5: (json['pm2_5'] as num).toDouble(),
      time: dateTimeFromUtcString(json['timestamp']),
      healthTips: (json['health_tips'] as List<dynamic>?)
              ?.map((e) => HealthTip.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
