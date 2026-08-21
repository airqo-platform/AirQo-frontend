import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
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

ForecastGuidance guidanceFromMeasurement(Measurement measurement) {
  final tips = measurement.healthTips;
  if (tips == null || tips.isEmpty) {
    return const ForecastGuidance();
  }
  final tip = tips.first;
  return ForecastGuidance(
    message: _trimOrNull(tip.description) ??
        _trimOrNull(tip.tagLine) ??
        _trimOrNull(tip.title),
  );
}

bool isForecastToday(DateTime forecastTime, [DateTime? now]) {
  final reference = (now ?? DateTime.now()).toLocal();
  return _fmtDate(forecastTime.toLocal()) == _fmtDate(reference);
}

bool isCurrentHourEntry(HourlyForecastEntry entry, [DateTime? now]) {
  final reference = (now ?? DateTime.now()).toLocal();
  final entryTime = entry.time.toLocal();
  return entryTime.year == reference.year &&
      entryTime.month == reference.month &&
      entryTime.day == reference.day &&
      entryTime.hour == reference.hour;
}

bool hasLiveReading(Measurement? measurement) =>
    measurement?.pm25?.value != null;

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

  factory ForecastReadingSnapshot.fromMeasurement(Measurement measurement) {
    return ForecastReadingSnapshot(
      pm25: measurement.pm25!.value!,
      aqiCategory: measurement.aqiCategory ?? 'Unavailable',
      aqiColor: measurement.aqiColor ?? '',
    );
  }

  factory ForecastReadingSnapshot.fromDailyOrLive({
    required Forecast forecast,
    Measurement? measurement,
    DateTime? now,
  }) {
    if (isForecastToday(forecast.time, now) && hasLiveReading(measurement)) {
      return ForecastReadingSnapshot.fromMeasurement(measurement!);
    }
    return ForecastReadingSnapshot.fromDaily(forecast);
  }

  factory ForecastReadingSnapshot.fromHourlyOrLive({
    required HourlyForecastEntry entry,
    Measurement? measurement,
    DateTime? now,
  }) {
    if (isCurrentHourEntry(entry, now) &&
        isForecastToday(entry.time, now) &&
        hasLiveReading(measurement)) {
      return ForecastReadingSnapshot.fromMeasurement(measurement!);
    }
    return ForecastReadingSnapshot.fromHourly(entry);
  }
}

List<HourlyForecastEntry> hourlyEntriesForDate(
  HourlyForecastResponse? response,
  DateTime date, {
  bool skipCurrentHour = false,
  DateTime? now,
}) {
  if (response == null) return [];
  final dateStr = _fmtDate(date.toLocal());
  final entries = response.forecasts
      .where((e) => _fmtDate(e.time.toLocal()) == dateStr)
      .toList();

  if (!skipCurrentHour) return entries;

  final currentTime = now ?? DateTime.now();
  if (dateStr != _fmtDate(currentTime)) return entries;

  final nextHour = DateTime(
    currentTime.year,
    currentTime.month,
    currentTime.day,
    currentTime.hour,
  ).add(
    const Duration(hours: 1),
  );
  return entries.where((e) => !e.time.toLocal().isBefore(nextHour)).toList();
}

String _fmtDate(DateTime dt) {
  return '${dt.year.toString().padLeft(4, '0')}-'
      '${dt.month.toString().padLeft(2, '0')}-'
      '${dt.day.toString().padLeft(2, '0')}';
}

int defaultHourlyIndex(
    List<HourlyForecastEntry> entries, DateTime selectedDay) {
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
