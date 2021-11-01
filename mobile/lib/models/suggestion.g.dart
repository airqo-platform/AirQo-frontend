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
    placeId: json['place_id'] as String,
    description: json['description'] as String,
  );
}

Map<String, dynamic> _$SuggestionToJson(Suggestion instance) =>
    <String, dynamic>{
      'place_id': instance.placeId,
      'description': instance.description,
    };
