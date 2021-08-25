import 'package:json_annotation/json_annotation.dart';

part 'suggestion.g.dart';

@JsonSerializable()
class Suggestion {
  @JsonKey(name: 'place_id', required: true)
  final String placeId;

  final String description;

  Suggestion({required this.placeId, required this.description});

  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);

  @override
  String toString() {
    return '$description';
  }

  static String dbDescription() => 'description';

  static String dbName() => 'search_table';

  static String dbPlaceId() => 'place_id';

  static String searchHistoryTableCreateStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbName()}('
      '${dbPlaceId()} TEXT PRIMARY KEY, '
      '${dbDescription()} TEXT)';

  static String searchHistoryTableDropStmt() =>
      'DROP TABLE IF EXISTS ${dbName()}';
}
