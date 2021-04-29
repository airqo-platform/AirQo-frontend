class Suggestion {

  Suggestion(this.placeId, this.description);

  final String placeId;
  final String description;

  @override
  String toString() {
    return 'Suggestion(description: $description, placeId: $placeId)';
  }
}
