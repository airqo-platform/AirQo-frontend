import 'package:app/utils/extensions.dart';
import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';

part 'suggestion.g.dart';

@JsonSerializable()
class Suggestion {
  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  Suggestion(this.placeId, this.suggestionDetails);
  @JsonKey(name: 'place_id', required: true)
  final String placeId;

  @JsonKey(name: 'structured_formatting')
  final SuggestionDetails suggestionDetails;

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      '${dbPlaceId()} TEXT PRIMARY KEY, '
      '${dbDescription()} TEXT)';

  static String dbDescription() => 'description';

  static String dbName() => 'search_table';

  static String dbPlaceId() => 'place_id';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<Suggestion> parseSuggestions(dynamic jsonBody) {
    final suggestions = <Suggestion>[];

    final jsonArray = jsonBody['predictions'];
    for (final jsonElement in jsonArray) {
      try {
        final measurement = Suggestion.fromJson(jsonElement);
        suggestions.add(measurement);
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }
    return suggestions;
  }
}

@JsonSerializable()
class SuggestionDetails {
  SuggestionDetails(this.mainText, this.secondaryText);

  factory SuggestionDetails.fromJson(Map<String, dynamic> json) =>
      _$SuggestionDetailsFromJson(json);
  @JsonKey(name: 'main_text', required: true)
  final String mainText;

  @JsonKey(name: 'secondary_text', required: true)
  final String secondaryText;

  String getMainText() {
    return mainText.toTitleCase();
  }

  String getSecondaryText() {
    return secondaryText.toTitleCase();
  }

  Map<String, dynamic> toJson() => _$SuggestionDetailsToJson(this);
}
