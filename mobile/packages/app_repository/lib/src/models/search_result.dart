import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/src/models/search_result_item.dart';

class SearchResult {
  SearchResult({required this.items});

  factory SearchResult.fromPredictions(List<Prediction> predictions, {List<String>? countries}) {
    final items = predictions.map(SearchResultItem.fromPrediction).toList();
    final africanResults = <SearchResultItem>[];
    for (final item in items) {
      try {
        africanResults.add(item);
        if(countries == null || countries.isEmpty){
          africanResults.add(item);
        }
        else{
          if (countries.any((country) => item.location.toLowerCase().contains(country.toLowerCase()))) {
            africanResults.add(item);
          }
        }
      } catch (_) {}
    }
    return SearchResult(items: africanResults);
  }

  final List<SearchResultItem> items;
}
