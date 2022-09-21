// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: implicit_dynamic_parameter

part of 'prediction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SuggestionDetails _$SuggestionDetailsFromJson(Map<String, dynamic> json) =>
    $checkedCreate(
      'SuggestionDetails',
      json,
      ($checkedConvert) {
        $checkKeys(
          json,
          requiredKeys: const ['main_text', 'secondary_text'],
        );
        final val = SuggestionDetails(
          $checkedConvert('main_text', (v) => v as String),
          $checkedConvert('secondary_text', (v) => v as String),
        );
        return val;
      },
      fieldKeyMap: const {
        'mainText': 'main_text',
        'secondaryText': 'secondary_text'
      },
    );

Prediction _$PredictionFromJson(Map<String, dynamic> json) => $checkedCreate(
      'Prediction',
      json,
      ($checkedConvert) {
        final val = Prediction(
          $checkedConvert('place_id', (v) => v as String),
          $checkedConvert('description', (v) => v as String),
          $checkedConvert('structured_formatting',
              (v) => SuggestionDetails.fromJson(v as Map<String, dynamic>)),
        );
        return val;
      },
      fieldKeyMap: const {
        'placeId': 'place_id',
        'suggestionDetails': 'structured_formatting'
      },
    );
