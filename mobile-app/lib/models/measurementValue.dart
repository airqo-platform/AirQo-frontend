import 'package:json_annotation/json_annotation.dart';

part 'measurementValue.g.dart';

@JsonSerializable()
class MeasurementValue {
  @JsonKey(required: false, defaultValue: -0.1, name: 'calibratedValue')
  final double calibratedValue;

  @JsonKey(required: false, defaultValue: -0.1, name: 'value')
  final double value;

  MeasurementValue({required this.value, required this.calibratedValue});

  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  Map<String, dynamic> toJson() => _$MeasurementValueToJson(this);
}
