import 'package:json_annotation/json_annotation.dart';

part 'suggestion.g.dart';

@JsonSerializable()
class Suggestion {
  Suggestion({required this.placeId, required this.description});

  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  @JsonKey(name: 'place_id', required: true)
  final String placeId;
  final String description;

  static String dbName() => 'search_table';

  static String dbDescription() => 'description';

  static String dbPlaceId() => 'place_id';

  static String searchHistoryTableDropStmt() =>
      'DROP TABLE IF EXISTS ${dbName()}';

  static String searchHistoryTableCreateStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbName()}('
      '${dbPlaceId()} TEXT PRIMARY KEY, '
      '${dbDescription()} TEXT)';

  @override
  String toString() {
    return '$description';
  }

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);
}
