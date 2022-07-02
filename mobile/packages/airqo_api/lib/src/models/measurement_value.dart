import 'package:json_annotation/json_annotation.dart';

part 'measurement_value.g.dart';

@JsonSerializable()
class MeasurementValue {
  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  const MeasurementValue({
    required this.value,
    required this.calibratedValue,
  });

  @JsonKey(required: false, name: 'calibratedValue')
  final double? calibratedValue;

  @JsonKey(required: false, name: 'value')
  final double value;
}
