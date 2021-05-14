
import 'package:json_annotation/json_annotation.dart';

part 'predict.g.dart';

@JsonSerializable()
class Predict {
  Predict({
    required this.value,
    required this.lower,
    required this.time,
    required this.upper,
  });

  factory Predict.fromJson(Map<String, dynamic> json) => _$PredictFromJson(json);

  Map<String, dynamic> toJson() => _$PredictToJson(this);

  @JsonKey(required: true, name: 'prediction_time')
  String time;

  @JsonKey(required: true, name: 'prediction_value')
  double value;

  @JsonKey(required: true, name: 'lower_ci')
  double lower;

  @JsonKey(required: true, name: 'upper_ci')
  double upper;

}