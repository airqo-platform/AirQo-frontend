import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/src/models/search_result_item.dart';

List<String> africaCountries = <String>[
  'uganda',
  'kenya',
  'ethiopia',
  'ghana',
  'nigeria'
];

class SearchResult {
  SearchResult({required this.items});

  factory SearchResult.fromPredictions(List<Prediction> predictions) {
    final items = predictions.map(SearchResultItem.fromPrediction).toList();
    final africanResults = <SearchResultItem>[];
    for (final item in items) {
      try {
        if (africaCountries.any(item.location.toLowerCase().contains) ||
            africaCountries.any(item.name.toLowerCase().contains)) {
          africanResults.add(item);
        }
      } catch (_) {}
    }
    return SearchResult(items: africanResults);
  }

  final List<SearchResultItem> items;
}
