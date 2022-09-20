import 'package:airqo_api/airqo_api.dart';

class SearchResultItem {
  SearchResultItem({
    required this.id,
    required this.name,
    required this.location,
  });

  factory SearchResultItem.fromPrediction(Prediction prediction) {
    return SearchResultItem(
      id: prediction.placeId,
      name: prediction.suggestionDetails.mainText,
      location: prediction.suggestionDetails.secondaryText,
    );
  }

  final String id;
  final String name;
  final String location;
}
