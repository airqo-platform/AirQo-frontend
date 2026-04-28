import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

enum PlaceType { home, work, school, gym, family, other }

extension PlaceTypeExtension on PlaceType {
  String get label {
    switch (this) {
      case PlaceType.home: return 'Home';
      case PlaceType.work: return 'Work';
      case PlaceType.school: return 'School';
      case PlaceType.gym: return 'Gym';
      case PlaceType.family: return 'Family';
      case PlaceType.other: return 'Other';
    }
  }

  IconData get icon {
    switch (this) {
      case PlaceType.home: return Icons.home_outlined;
      case PlaceType.work: return Icons.business_center_outlined;
      case PlaceType.school: return Icons.school_outlined;
      case PlaceType.gym: return Icons.fitness_center_outlined;
      case PlaceType.family: return Icons.people_outline;
      case PlaceType.other: return Icons.place_outlined;
    }
  }

}

class TimeWindow extends Equatable {
  final TimeOfDay arrive;
  final TimeOfDay leave;

  const TimeWindow({required this.arrive, required this.leave});

  int get durationMinutes {
    final a = arrive.hour * 60 + arrive.minute;
    final l = leave.hour * 60 + leave.minute;
    return l > a ? l - a : (24 * 60) - a + l;
  }

  String get durationLabel {
    final mins = durationMinutes;
    final h = mins ~/ 60;
    final m = mins % 60;
    if (h == 0) return '${m}m';
    if (m == 0) return '${h}h';
    return '${h}h ${m}m';
  }

  String get timeRangeLabel => '${_fmt(arrive)} – ${_fmt(leave)}';

  String _fmt(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final p = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $p';
  }

  @override
  List<Object?> get props => [arrive, leave];

  Map<String, dynamic> toJson() => {
        'arrive_h': arrive.hour,
        'arrive_m': arrive.minute,
        'leave_h': leave.hour,
        'leave_m': leave.minute,
      };

  factory TimeWindow.fromJson(Map<String, dynamic> json) => TimeWindow(
        arrive: TimeOfDay(hour: json['arrive_h'] as int, minute: json['arrive_m'] as int),
        leave: TimeOfDay(hour: json['leave_h'] as int, minute: json['leave_m'] as int),
      );

  // Supports overnight spans: if leave < arrive the window wraps past midnight.
  bool overlapsHour(int hour) {
    assert(hour >= 0 && hour < 24);
    final hs = hour * 60;
    final he = hs + 60;
    final a = arrive.hour * 60 + arrive.minute;
    final b = leave.hour * 60 + leave.minute;
    if (a <= b) {
      return he > a && hs < b;
    }
    return (he > a && hs < 24 * 60) || (he > 0 && hs < b);
  }
}

class DeclaredPlace extends Equatable {
  final String siteId;
  // User-chosen label (e.g. "Hakim's Home") — distinct from locationName which is the map search result.
  final String displayName;
  final String locationName;
  final String city;
  final PlaceType type;
  final TimeWindow? weekdayWindow;
  final TimeWindow? weekendWindow;
  final bool absentOnWeekdays;
  final bool absentOnWeekends;

  const DeclaredPlace({
    required this.siteId,
    required this.displayName,
    required this.locationName,
    required this.city,
    required this.type,
    this.weekdayWindow,
    this.weekendWindow,
    this.absentOnWeekdays = false,
    this.absentOnWeekends = false,
  });

  bool get hasTimeWindow => weekdayWindow != null || weekendWindow != null;

  bool isAbsentOn(DateTime date) {
    final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
    return isWeekend ? absentOnWeekends : absentOnWeekdays;
  }

  TimeWindow? windowFor(DateTime date) {
    final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
    if (isWeekend) {
      if (absentOnWeekends) return null;
      return weekendWindow ?? weekdayWindow;
    }
    if (absentOnWeekdays) return null;
    return weekdayWindow ?? weekendWindow;
  }

  TimeWindow? get activeWindow => windowFor(DateTime.now());

  String dailyHoursLabelFor(DateTime date) {
    if (isAbsentOn(date)) {
      final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
      return isWeekend ? 'Not there on weekends' : 'Not there on weekdays';
    }
    final w = windowFor(date);
    if (w == null) return '';
    return '${w.durationLabel} per day';
  }

  String get dailyHoursLabel => dailyHoursLabelFor(DateTime.now());

  DeclaredPlace copyWith({
    String? displayName,
    String? locationName,
    String? city,
    PlaceType? type,
    TimeWindow? weekdayWindow,
    TimeWindow? weekendWindow,
    bool? absentOnWeekdays,
    bool? absentOnWeekends,
    bool clearWeekdayWindow = false,
    bool clearWeekendWindow = false,
  }) {
    return DeclaredPlace(
      siteId: siteId,
      displayName: displayName ?? this.displayName,
      locationName: locationName ?? this.locationName,
      city: city ?? this.city,
      type: type ?? this.type,
      weekdayWindow: clearWeekdayWindow ? null : (weekdayWindow ?? this.weekdayWindow),
      weekendWindow: clearWeekendWindow ? null : (weekendWindow ?? this.weekendWindow),
      absentOnWeekdays: absentOnWeekdays ?? this.absentOnWeekdays,
      absentOnWeekends: absentOnWeekends ?? this.absentOnWeekends,
    );
  }

  @override
  List<Object?> get props => [
        siteId,
        displayName,
        locationName,
        city,
        type,
        weekdayWindow,
        weekendWindow,
        absentOnWeekdays,
        absentOnWeekends,
      ];

  Map<String, dynamic> toJson() => {
        'site_id': siteId,
        'display_name': displayName,
        'location_name': locationName,
        'city': city,
        'type': type.name,
        'absent_on_weekdays': absentOnWeekdays,
        'absent_on_weekends': absentOnWeekends,
        if (weekdayWindow != null) 'weekday_window': weekdayWindow!.toJson(),
        if (weekendWindow != null) 'weekend_window': weekendWindow!.toJson(),
      };

  factory DeclaredPlace.fromJson(Map<String, dynamic> json) {
    final displayName = json['display_name'] as String;
    return DeclaredPlace(
        siteId: json['site_id'] as String,
        displayName: displayName,
        locationName: json['location_name'] as String? ?? displayName,
        city: json['city'] as String,
        type: PlaceType.values.byName(json['type'] as String),
        weekdayWindow: json['weekday_window'] != null
            ? TimeWindow.fromJson(Map<String, dynamic>.from(json['weekday_window'] as Map))
            : null,
        weekendWindow: json['weekend_window'] != null
            ? TimeWindow.fromJson(Map<String, dynamic>.from(json['weekend_window'] as Map))
            : null,
        absentOnWeekdays: json['absent_on_weekdays'] as bool? ?? false,
        absentOnWeekends: json['absent_on_weekends'] as bool? ?? false,
      );
  }
}

enum ExposureLevel { low, moderate, high }

extension ExposureLevelExtension on ExposureLevel {
  String get label {
    switch (this) {
      case ExposureLevel.low: return 'Low';
      case ExposureLevel.moderate: return 'Moderate';
      case ExposureLevel.high: return 'High';
    }
  }

  String get copy {
    switch (this) {
      case ExposureLevel.low: return 'Mostly clean air while you were here';
      case ExposureLevel.moderate: return 'Noticeable pollution during your time here';
      case ExposureLevel.high: return 'Elevated pollution while you were here';
    }
  }

  Color get color {
    switch (this) {
      case ExposureLevel.low: return const Color(0xFF34C759);
      case ExposureLevel.moderate: return const Color(0xFFE8A000);
      case ExposureLevel.high: return const Color(0xFFF7453C);
    }
  }

  Color get bgColor {
    switch (this) {
      case ExposureLevel.low: return const Color(0xFFDFF9E5);
      case ExposureLevel.moderate: return const Color(0xFFFFF3D0);
      case ExposureLevel.high: return const Color(0xFFFFE5E4);
    }
  }

  static ExposureLevel fromPm25(double pm25) {
    if (pm25 < 12) return ExposureLevel.low;
    if (pm25 < 35.5) return ExposureLevel.moderate;
    return ExposureLevel.high;
  }
}

class HourlyReading {
  final int hour;
  final double? pm25;

  const HourlyReading({required this.hour, this.pm25});

  ExposureLevel? get level => pm25 != null ? ExposureLevelExtension.fromPm25(pm25!) : null;
  bool get isOffline => pm25 == null;
}
