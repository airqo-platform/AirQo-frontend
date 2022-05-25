import 'package:json_annotation/json_annotation.dart';

part 'measurement_value.g.dart';

@JsonSerializable()
class MeasurementValue {
  factory MeasurementValue.fromJson(Map<String, dynamic> json) =>
      _$MeasurementValueFromJson(json);

  MeasurementValue({required this.value, required this.calibratedValue});
  @JsonKey(required: false, defaultValue: -0.1, name: 'calibratedValue')
  double calibratedValue = -0.1;

  @JsonKey(required: false, defaultValue: -0.1, name: 'value')
  double value = -0.1;

  Map<String, dynamic> toJson() => _$MeasurementValueToJson(this);

  @override
  String toString() {
    return 'MeasurementValue{calibratedValue: $calibratedValue, value: $value}';
  }
}
