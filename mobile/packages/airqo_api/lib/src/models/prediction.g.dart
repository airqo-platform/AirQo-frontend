// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'prediction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SuggestionDetails _$SuggestionDetailsFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const ['main_text', 'secondary_text'],
  );
  return SuggestionDetails(
    json['main_text'] as String,
    json['secondary_text'] as String,
  );
}

Prediction _$PredictionFromJson(Map<String, dynamic> json) => Prediction(
      json['place_id'] as String,
      json['description'] as String,
      SuggestionDetails.fromJson(
          json['structured_formatting'] as Map<String, dynamic>),
    );
