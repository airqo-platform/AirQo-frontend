// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'suggestion.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Suggestion _$SuggestionFromJson(Map<String, dynamic> json) {
  $checkKeys(
    json,
    requiredKeys: const ['place_id'],
  );
  return Suggestion(
    json['place_id'] as String,
    SuggestionDetails.fromJson(
        json['structured_formatting'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$SuggestionToJson(Suggestion instance) =>
    <String, dynamic>{
      'place_id': instance.placeId,
      'structured_formatting': instance.suggestionDetails,
    };

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

Map<String, dynamic> _$SuggestionDetailsToJson(SuggestionDetails instance) =>
    <String, dynamic>{
      'main_text': instance.mainText,
      'secondary_text': instance.secondaryText,
    };
