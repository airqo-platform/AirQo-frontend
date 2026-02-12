import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import '../models/country_model.dart';
import '../models/countries_api_response.dart';

class CountryRepository extends BaseRepository {
  static const String _cacheKey = 'countries';

  static List<CountryModel>? _memoryCache;

  Future<List<CountryModel>> fetchCountries() async {
    try {
      if (_memoryCache != null && _memoryCache!.isNotEmpty) {
        return _memoryCache!;
      }

      final cachedData = await _loadFromCache();
      if (cachedData != null && cachedData.isNotEmpty) {
        _memoryCache = cachedData;
        loggy.info('Loaded ${cachedData.length} countries from cache');
      }

      final response = await createGetRequest(
        ApiUtils.fetchCountries,
        {},
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final countriesResponse = countriesApiResponseFromJson(response.body);

        if (countriesResponse.success && countriesResponse.countries.isNotEmpty) {
          final countries = countriesResponse.countries.map((countryData) {
            final countryName = countryData.formattedCountryName;
            final flag = CountryModel.getFlagFromCountryName(countryName);
            return CountryModel(flag, countryName, sites: countryData.sites);
          }).toList();

          countries.sort((a, b) => a.countryName.compareTo(b.countryName));

          _memoryCache = countries;
          await _saveToCache(countries);

          loggy.info('Fetched and cached ${countries.length} countries from API');
          return countries;
        }
      }

      if (cachedData != null && cachedData.isNotEmpty) {
        loggy.info('API failed, using cached countries');
        return cachedData;
      }

      loggy.warning('No countries available - API and cache both failed');
      return [];
    } catch (e) {
      loggy.error('Error fetching countries: $e');

      final cachedData = await _loadFromCache();
      if (cachedData != null && cachedData.isNotEmpty) {
        _memoryCache = cachedData;
        return cachedData;
      }

      loggy.warning('No countries available - exception occurred and no cache');
      return [];
    }
  }

  Future<List<CountryModel>?> _loadFromCache() async {
    try {
      final cachedData = await CacheManager().get<List<dynamic>>(
        boxName: CacheBoxName.location,
        key: _cacheKey,
        fromJson: (json) => json['countries'] as List<dynamic>,
      );

      if (cachedData != null) {
        final countries = cachedData.data
            .map((item) => CountryModel(
                  item['flag'] as String,
                  item['countryName'] as String,
                  sites: item['sites'] as int? ?? 0,
                ))
            .toList();
        return countries;
      }
    } catch (e) {
      loggy.error('Error loading countries from cache: $e');
    }
    return null;
  }

  Future<void> _saveToCache(List<CountryModel> countries) async {
    try {
      await CacheManager().put<List<dynamic>>(
        boxName: CacheBoxName.location,
        key: _cacheKey,
        data: countries
            .map((c) => {
                  'flag': c.flag,
                  'countryName': c.countryName,
                  'sites': c.sites,
                })
            .toList(),
        toJson: (data) => {'countries': data},
      );
    } catch (e) {
      loggy.error('Error saving countries to cache: $e');
    }
  }

  static List<CountryModel> get countries {
    return _memoryCache ?? [];
  }

  /// Returns only countries that have active measurements
  static List<CountryModel> getActiveCountries(Set<String> activeCountryNames) {
    if (activeCountryNames.isEmpty) {
      return countries.where((country) => country.sites > 0).toList();
    }

    return countries
        .where((country) => activeCountryNames.contains(country.countryName))
        .toList();
  }

  /// Extracts active country names from measurements
  static Set<String> extractActiveCountryNames(List<dynamic> measurements) {
    return measurements
        .where((m) => m.siteDetails?.country != null)
        .map((m) => m.siteDetails!.country! as String)
        .toSet();
  }

  static Future<void> clearCache() async {
    _memoryCache = null;
    try {
      await CacheManager().delete(
        boxName: CacheBoxName.location,
        key: _cacheKey,
      );
    } catch (e) {
      // Ignore errors
    }
  }
}