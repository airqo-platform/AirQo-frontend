import 'dart:convert';
import 'package:airqo/src/app/dashboard/models/site_search_result.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

abstract class SitesRepository {
  Future<List<SiteSearchResult>> searchSites(
    String query, {
    int limit = 20,
    int skip = 0,
  });
}

class SitesImpl extends SitesRepository with NetworkLoggy {
  final http.Client _httpClient;

  SitesImpl({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  Future<Map<String, String>> _getHeaders() async {
    final userToken =
        await HiveRepository.getData('token', HiveBoxNames.authBox);
    final headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    if (userToken != null && (userToken as String).isNotEmpty) {
      headers["Authorization"] = "JWT $userToken";
    } else {
      final appToken = dotenv.env["AIRQO_MOBILE_TOKEN"];
      if (appToken != null && appToken.isNotEmpty) {
        headers["Authorization"] = "JWT $appToken";
      }
    }
    return headers;
  }

  @override
  Future<List<SiteSearchResult>> searchSites(
    String query, {
    int limit = 20,
    int skip = 0,
  }) async {
    loggy.info('Searching sites for: "$query" (limit: $limit, skip: $skip)');

    try {
      final uri =
          Uri.parse('${ApiUtils.baseUrl}${ApiUtils.sitesSearch}').replace(
        queryParameters: {
          'search': query,
          'limit': limit.toString(),
          'skip': skip.toString(),
        },
      );

      final headers = await _getHeaders();
      final response = await _httpClient.get(uri, headers: headers);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final sites = (data['sites'] as List<dynamic>?) ?? [];

        loggy.info('Received ${sites.length} sites from search API');

        return sites
            .map((site) => _toSiteSearchResult(site as Map<String, dynamic>))
            .whereType<SiteSearchResult>()
            .toList();
      } else {
        loggy.warning('Sites search API error: ${response.statusCode}');
        throw Exception(
            'Sites search failed with status ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      loggy.error('Error searching sites: $e');
      rethrow;
    }
  }

  SiteSearchResult? _toSiteSearchResult(Map<String, dynamic> site) {
    final id = site['_id'] as String?;
    if (id == null) return null;

    return SiteSearchResult(
      id: id,
      name: site['name'] as String?,
      searchName: site['search_name'] as String?,
      city: site['city'] as String?,
      town: site['town'] as String?,
      district: site['district'] as String?,
      country: site['country'] as String?,
      formattedName: site['formatted_name'] as String?,
      locationName: site['location_name'] as String?,
    );
  }
}
