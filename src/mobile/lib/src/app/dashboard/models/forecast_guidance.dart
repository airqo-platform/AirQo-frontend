import 'package:airqo/src/app/dashboard/models/forecast_response.dart';

/// API-sourced guidance for the forecast modal guidance panel.
class ForecastGuidance {
  final String? message;
  final String? trendMessage;

  const ForecastGuidance({
    this.message,
    this.trendMessage,
  });

  bool get hasContent => _nonEmpty(message) || _nonEmpty(trendMessage);

  static bool _nonEmpty(String? value) =>
      value != null && value.trim().isNotEmpty;
}

ForecastGuidance guidanceFromForecast(Forecast forecast) {
  return ForecastGuidance(
    message: _trimOrNull(forecast.aqiLabel),
    trendMessage: _trimOrNull(forecast.trendMessage),
  );
}

ForecastGuidance guidanceFromHourlyEntry(HourlyForecastEntry entry) {
  return ForecastGuidance(
    message: _trimOrNull(entry.aqiLabel),
    trendMessage: _trimOrNull(entry.trendMessage),
  );
}

String? _trimOrNull(String? value) {
  if (value == null) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

/// Normalized reading fields for the shared forecast detail card.
class ForecastReadingSnapshot {
  final double pm25;
  final String aqiCategory;
  final String aqiColor;
  final double? forecastConfidence;
  final ForecastMet? met;

  const ForecastReadingSnapshot({
    required this.pm25,
    required this.aqiCategory,
    required this.aqiColor,
    this.forecastConfidence,
    this.met,
  });

  factory ForecastReadingSnapshot.fromDaily(Forecast forecast) {
    return ForecastReadingSnapshot(
      pm25: forecast.pm25,
      aqiCategory: forecast.aqiCategory,
      aqiColor: forecast.aqiColor,
      forecastConfidence: forecast.forecastConfidence,
      met: forecast.met,
    );
  }

  factory ForecastReadingSnapshot.fromHourly(HourlyForecastEntry entry) {
    return ForecastReadingSnapshot(
      pm25: entry.pm25Mean,
      aqiCategory: entry.aqiCategory,
      aqiColor: entry.aqiColor,
      forecastConfidence: entry.forecastConfidence,
      met: entry.met,
    );
  }
}

List<HourlyForecastEntry> hourlyEntriesForDate(
  HourlyForecastResponse? response,
  DateTime date,
) {
  if (response == null) return [];
  final dateStr = _fmtDate(date.toLocal());
  return response.forecasts
      .where((e) => _fmtDate(e.time.toLocal()) == dateStr)
      .toList();
}

String _fmtDate(DateTime dt) {
  return '${dt.year.toString().padLeft(4, '0')}-'
      '${dt.month.toString().padLeft(2, '0')}-'
      '${dt.day.toString().padLeft(2, '0')}';
}

int defaultHourlyIndex(List<HourlyForecastEntry> entries, DateTime selectedDay) {
  if (entries.isEmpty) return 0;
  final now = DateTime.now();
  final todayStr = _fmtDate(now);
  final dayStr = _fmtDate(selectedDay.toLocal());
  if (dayStr != todayStr) return 0;

  for (var i = 0; i < entries.length; i++) {
    if (entries[i].time.toLocal().hour == now.hour) return i;
  }
  return 0;
}
