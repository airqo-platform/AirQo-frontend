import 'package:json_annotation/json_annotation.dart';

part 'air_quality_tip.g.dart';

@JsonSerializable()
class AirQualityTip {
  final String title;
  final String message;
  final String imageUrl;

  AirQualityTip(this.title, this.message, this.imageUrl);

  factory AirQualityTip.fromJson(Map<String, dynamic> json) =>
      _$AirQualityTipFromJson(json);

  Map<String, dynamic> toJson() => _$AirQualityTipToJson(this);
}
