import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/src/models/search_result_item.dart';

class SearchResult {
  SearchResult({required this.items});

  factory SearchResult.fromPredictions(List<Prediction> predictions) {
    final items = predictions.map(SearchResultItem.fromPrediction).toList();
    final africanResults = <SearchResultItem>[];
    for (final item in items) {
      try {
        //  TODO Filter african countries
        africanResults.add(item);
      } catch (_) {}
    }
    return SearchResult(items: africanResults);
  }

  final List<SearchResultItem> items;
}
