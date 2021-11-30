import 'package:app/utils/string_extension.dart';
import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';

part 'suggestion.g.dart';

@JsonSerializable()
class Suggestion {
  @JsonKey(name: 'place_id', required: true)
  final String placeId;

  @JsonKey(name: 'structured_formatting')
  final SuggestionDetails suggestionDetails;

  Suggestion(this.placeId, this.suggestionDetails);

  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      '${dbPlaceId()} TEXT PRIMARY KEY, '
      '${dbDescription()} TEXT)';

  static String dbDescription() => 'description';

  static String dbName() => 'search_table';

  static String dbPlaceId() => 'place_id';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static List<Suggestion> parseSuggestions(dynamic jsonBody) {
    var suggestions = <Suggestion>[];

    var jsonArray = jsonBody['predictions'];
    for (var jsonElement in jsonArray) {
      try {
        var measurement = Suggestion.fromJson(jsonElement);
        suggestions.add(measurement);
      } catch (e) {
        debugPrint(e.toString());
      }
    }
    return suggestions;
  }
}

@JsonSerializable()
class SuggestionDetails {
  @JsonKey(name: 'main_text', required: true)
  final String mainText;

  @JsonKey(name: 'secondary_text', required: true)
  final String secondaryText;

  SuggestionDetails(this.mainText, this.secondaryText);

  factory SuggestionDetails.fromJson(Map<String, dynamic> json) =>
      _$SuggestionDetailsFromJson(json);

  String getMainText() {
    return mainText.toTitleCase();
  }

  String getSecondaryText() {
    return secondaryText.toTitleCase();
  }

  Map<String, dynamic> toJson() => _$SuggestionDetailsToJson(this);
}
