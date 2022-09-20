import 'package:json_annotation/json_annotation.dart';

part 'prediction.g.dart';

@JsonSerializable()
class SuggestionDetails {
  SuggestionDetails(
    this.mainText,
    this.secondaryText,
  );

  factory SuggestionDetails.fromJson(Map<String, dynamic> json) =>
      _$SuggestionDetailsFromJson(json);
  @JsonKey(name: 'main_text', required: true)
  final String mainText;

  @JsonKey(name: 'secondary_text', required: true)
  final String secondaryText;
}

@JsonSerializable()
class Prediction {
  factory Prediction.fromJson(Map<String, dynamic> json) =>
      _$PredictionFromJson(json);

  Prediction(this.placeId, this.description, this.suggestionDetails);

  @JsonKey(name: 'place_id')
  final String placeId;

  final String description;
  @JsonKey(name: 'structured_formatting')
  final SuggestionDetails suggestionDetails;

  static List<Prediction> parsePredictions(dynamic jsonBody) {
    final suggestions = <Prediction>[];

    final jsonArray = jsonBody['predictions'];
    for (final jsonElement in jsonArray) {
      try {
        final measurement = Prediction.fromJson(jsonElement);
        suggestions.add(measurement);
      } catch (exception, stackTrace) {
        print('$exception\n$stackTrace');
      }
    }

    return suggestions;
  }
}
