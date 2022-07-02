import 'package:airqo_api/airqo_api.dart';
import 'package:app_repository/src/models/search_result.dart';

class SearchCache {
  final _cache = <String, SearchResult>{};
  final _placeDetailsCache = <String, Place>{};

  SearchResult? getSearchResult(String term) => _cache[term];

  void setSearchResult(String term, SearchResult result) =>
      _cache[term] = result;

  bool containsSearchResult(String term) => _cache.containsKey(term);

  void removeSearchResult(String term) => _cache.remove(term);

  Place? getPlaceDetails(String placeId) => _placeDetailsCache[placeId];

  void setPlaceDetails(String placeId, Place result) =>
      _placeDetailsCache[placeId] = result;

  bool containsPlaceDetails(String placeId) =>
      _placeDetailsCache.containsKey(placeId);

  void removePlaceDetails(String placeId) => _placeDetailsCache.remove(placeId);
}
