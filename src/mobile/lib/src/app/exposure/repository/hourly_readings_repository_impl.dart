import 'dart:convert';

import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/hourly_readings_repository.dart';

class HourlyReadingsRepositoryImpl extends HourlyReadingsRepository
    with NetworkLoggy {
  static const Duration _defaultRequestTimeout = Duration(seconds: 15);

  HourlyReadingsRepositoryImpl({
    http.Client? httpClient,
    Duration requestTimeout = _defaultRequestTimeout,
  })  : _httpClient = httpClient ?? http.Client(),
        _requestTimeout = requestTimeout;

  final http.Client _httpClient;
  final Duration _requestTimeout;

  @override
  Future<Map<String, List<HourlyReading>>> fetchHourlyReadingsForPlaces(
    List<DeclaredPlace> places,
    DateTime date,
  ) async {
    if (places.isEmpty) return const {};

    final range = _utcDayRange(date);
    final token = dotenv.env['AIRQO_API_TOKEN'] ?? '';
    final uri = Uri.parse(
      '${ApiUtils.baseUrl}/api/v3/public/analytics/data-download',
    ).replace(queryParameters: {'token': token});
    final unavailable = {
      for (final place in places) place.siteId: _emptyDay(),
    };

    try {
      final response = await _httpClient
          .post(
            uri,
            headers: const {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': ApiUtils.mobileUserAgent,
            },
            body: jsonEncode({
              'network': 'airqo',
              'datatype': 'calibrated',
              'downloadType': 'json',
              'outputFormat': 'airqo-standard',
              'device_category': 'lowcost',
              'minimum': true,
              'startDateTime': range.$1.toIso8601String(),
              'endDateTime': range.$2.toIso8601String(),
              'sites': places.map((place) => place.siteId).toList(),
              'pollutants': const ['pm2_5'],
              'frequency': 'hourly',
            }),
          )
          .timeout(_requestTimeout);
      if (response.statusCode != 200) {
        loggy.warning(
          'Batch hourly readings request failed: HTTP ${response.statusCode}',
        );
        return unavailable;
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      if (body['status'] != 'success' || body['data'] is! List) {
        loggy.warning('Batch hourly readings response was not successful');
        return unavailable;
      }

      final placesById = {
        for (final place in places) place.siteId: place,
      };
      final placesByUniqueName = <String, DeclaredPlace>{};
      final ambiguousNames = <String>{};
      for (final place in places) {
        for (final name in {place.monitorName, place.locationName}) {
          final key = _normalizedName(name);
          if (key.isEmpty || ambiguousNames.contains(key)) continue;
          final existing = placesByUniqueName[key];
          if (existing == null) {
            placesByUniqueName[key] = place;
          } else if (existing.siteId != place.siteId) {
            placesByUniqueName.remove(key);
            ambiguousNames.add(key);
          }
        }
      }
      final readingsBySite = <String, Map<int, HourlyReading>>{
        for (final place in places) place.siteId: {},
      };

      for (final item in (body['data'] as List).whereType<Map>()) {
        final measurement = Map<String, dynamic>.from(item);
        final responseSiteId =
            (measurement['site_id'] ?? measurement['siteId'] ?? '').toString();
        final place = placesById[responseSiteId] ??
            placesByUniqueName[_normalizedName(
              (measurement['site_name'] ?? '').toString(),
            )];
        if (place == null) continue;
        final timestamp = _parseAnalyticsTimestamp(measurement['datetime']);
        final pm25 = _pm25Value(measurement);
        if (timestamp == null || pm25 == null) continue;
        final localTime = timestamp.toLocal();
        if (!_isSameDay(localTime, date)) continue;
        readingsBySite[place.siteId]![localTime.hour] = HourlyReading(
          hour: localTime.hour,
          pm25: pm25,
        );
      }

      final result = {
        for (final place in places)
          place.siteId: List.generate(
            24,
            (hour) =>
                readingsBySite[place.siteId]![hour] ??
                HourlyReading(hour: hour),
          ),
      };
      if (kDebugMode) {
        final count = result.values.fold<int>(
          0,
          (total, readings) =>
              total + readings.where((reading) => reading.pm25 != null).length,
        );
        loggy.debug(
          'Mapped $count batch hourly readings for ${places.length} places',
        );
      }
      return result;
    } catch (error) {
      loggy.warning('Could not fetch batch hourly readings: $error');
      return unavailable;
    }
  }

  @override
  Future<List<HourlyReading>> fetchHourlyReadings(
      String siteId, DateTime date) async {
    final range = _utcDayRange(date);
    final token = dotenv.env['AIRQO_API_TOKEN'] ?? '';
    final uri = Uri.parse(
      '${ApiUtils.baseUrl}/api/v2/devices/measurements/sites/$siteId/historical',
    ).replace(
      queryParameters: {
        'token': token,
        'startTime': range.$1.toIso8601String(),
        'endTime': range.$2.toIso8601String(),
        'limit': '1000',
      },
    );

    try {
      final response = await _httpClient
          .get(
            uri,
            headers: const {
              'Accept': 'application/json',
              'User-Agent': ApiUtils.mobileUserAgent,
            },
          )
          .timeout(_requestTimeout);
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        if (body['success'] == true) {
          final measurements = body['measurements'];
          if (measurements is List) {
            final byHour = <int, HourlyReading>{};
            for (final item in measurements.whereType<Map>()) {
              final measurement = Map<String, dynamic>.from(item);
              final timestamp = DateTime.tryParse(
                (measurement['time'] ?? '').toString(),
              );
              if (timestamp == null) continue;
              final localTime = timestamp.toLocal();
              if (!_isSameDay(localTime, date)) continue;
              final pm25 = _pm25Value(measurement);
              if (pm25 == null) continue;
              byHour[localTime.hour] = HourlyReading(
                hour: localTime.hour,
                pm25: pm25,
              );
            }
            if (kDebugMode) {
              loggy.debug(
                'Mapped ${byHour.length} of ${measurements.length} hourly '
                'readings for $siteId on '
                '${date.year}-${date.month}-${date.day}',
              );
            }
            return List.generate(
              24,
              (hour) => byHour[hour] ?? HourlyReading(hour: hour),
            );
          }
        }
      }
      loggy.warning(
        'Hourly readings request failed for $siteId: HTTP ${response.statusCode}',
      );
    } catch (e) {
      loggy.warning('Could not fetch hourly readings for $siteId: $e');
    }
    return _emptyDay();
  }

  (DateTime, DateTime) _utcDayRange(DateTime date) {
    final localStart = DateTime(date.year, date.month, date.day);
    final localEnd = DateTime(date.year, date.month, date.day + 1)
        .subtract(const Duration(milliseconds: 1));
    return (localStart.toUtc(), localEnd.toUtc());
  }

  List<HourlyReading> _emptyDay() =>
      List.generate(24, (hour) => HourlyReading(hour: hour));

  bool _isSameDay(DateTime value, DateTime date) =>
      value.year == date.year &&
      value.month == date.month &&
      value.day == date.day;

  String _normalizedName(String value) => value.trim().toLowerCase();

  DateTime? _parseAnalyticsTimestamp(Object? value) {
    final raw = value?.toString().trim() ?? '';
    if (raw.isEmpty) return null;
    return DateTime.tryParse(raw.replaceFirst(' ', 'T'));
  }

  double? _pm25Value(Map<String, dynamic> measurement) {
    final pollutant = measurement['pm2_5_calibrated_value'] ??
        measurement['pm2_5'] ??
        measurement['pm25'];
    if (pollutant is num) return pollutant.toDouble();
    if (pollutant is Map) {
      final value = pollutant['value'];
      if (value is num) return value.toDouble();
    }
    return null;
  }
}
