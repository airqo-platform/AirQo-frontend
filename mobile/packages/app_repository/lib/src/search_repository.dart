import 'dart:async';

import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/src/models/search_cache.dart';

import 'models/search_result.dart';

class SearchRepository {
  SearchRepository({required this.searchApiKey})
      : _client = SearchApiClient(apiKey: searchApiKey);

  final SearchCache _cache = SearchCache();
  final SearchApiClient _client;
  final String searchApiKey;

  Future<SearchResult> search(String term) async {
    final cachedResult = _cache.getSearchResult(term);
    if (cachedResult != null) {
      return cachedResult;
    }
    final result =
        SearchResult.fromPredictions(await _client.fetchPredictions(term));
    _cache.setSearchResult(term, result);
    return result;
  }

  Future<Place?> placeDetails(String placeId) async {
    final cachedResult = _cache.getPlaceDetails(placeId);
    if (cachedResult != null) {
      return cachedResult;
    }
    final result = await _client.getPlaceDetails(placeId);
    if (result != null) _cache.setPlaceDetails(placeId, result);

    return result;
  }
}
