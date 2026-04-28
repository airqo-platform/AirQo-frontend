import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/hourly_readings_repository.dart';
import 'package:airqo/src/app/shared/repository/secure_storage_repository.dart';

class HourlyReadingsRepositoryImpl extends HourlyReadingsRepository with NetworkLoggy {
  static const String _baseUrl = 'https://api.airqo.net/api/v2';

  @override
  Future<List<HourlyReading>> fetchHourlyReadings(
      String siteId, DateTime date) async {
    final dateStr =
        '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final url = '$_baseUrl/devices/readings/sites/$siteId/hourly?date=$dateStr';

    try {
      final headers = await _getAuthHeaders();
      final response = await http.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        if (body['success'] == true) {
          final data = body['data'] as List<dynamic>;
          return data.map((e) {
            final m = e as Map<String, dynamic>;
            return HourlyReading(
              hour: m['hour'] as int,
              pm25: (m['pm25'] as num?)?.toDouble(),
            );
          }).toList();
        }
      }
    } catch (e) {
      loggy.warning('Could not fetch hourly readings for $siteId on $dateStr: $e');
    }
    return List.generate(24, (h) => HourlyReading(hour: h));
  }

  Future<Map<String, String>> _getAuthHeaders() async {
    final userToken = await SecureStorageRepository.instance
        .getSecureData(SecureStorageKeys.authToken);
    final headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (userToken != null && userToken.isNotEmpty) {
      headers['Authorization'] = 'JWT $userToken';
    } else {
      final appToken = dotenv.env['AIRQO_MOBILE_TOKEN'];
      if (appToken != null && appToken.isNotEmpty) {
        headers['Authorization'] = appToken;
      }
    }
    return headers;
  }
}
