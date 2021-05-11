import 'package:json_annotation/json_annotation.dart';

part 'suggestion.g.dart';

@JsonSerializable()
class Suggestion {
  Suggestion({required this.placeId, required this.description});

  @JsonKey(name: 'place_id', required: true)
  final String placeId;

  final String description;

  @override
  String toString() {
    return '$description';
  }

  factory Suggestion.fromJson(Map<String, dynamic> json) =>
      _$SuggestionFromJson(json);

  Map<String, dynamic> toJson() => _$SuggestionToJson(this);
}
