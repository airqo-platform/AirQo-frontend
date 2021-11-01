// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'predict.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Predict _$PredictFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const ['prediction_time', 'prediction_value'],
  );
  return Predict(
    value: (json['prediction_value'] as num).toDouble(),
    lower: (json['lower_ci'] as num?)?.toDouble() ?? 0.0,
    time: json['prediction_time'] as String,
    upper: (json['upper_ci'] as num?)?.toDouble() ?? 0.0,
  );
}

Map<String, dynamic> _$PredictToJson(Predict instance) => <String, dynamic>{
      'prediction_time': instance.time,
      'prediction_value': instance.value,
      'lower_ci': instance.lower,
      'upper_ci': instance.upper,
    };
