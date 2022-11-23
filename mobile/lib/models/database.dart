import 'dart:io';

import 'package:app/models/enum_constants.dart';
import 'package:app/utils/utils.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

abstract class Insight extends Table {
  DateTimeColumn get time => dateTime()();
  RealColumn get pm2_5 => real()();
  RealColumn get pm10 => real()();
  BoolColumn get available => boolean().withDefault(const Constant(true))();
  TextColumn get siteId => text()();
  IntColumn get frequency => intEnum<Frequency>()();

  @override
  Set<Column> get primaryKey => {
        siteId,
        frequency,
        time,
      };
}

@DataClassName("HistoricalInsight")
class HistoricalInsights extends Insight {}

@DataClassName("ForecastInsight")
class ForecastInsights extends Insight {}

@DriftDatabase(tables: [HistoricalInsights, ForecastInsights])
class AirQoDatabase extends _$AirQoDatabase {
  factory AirQoDatabase() {
    return _instance;
  }

  AirQoDatabase._internal() : super(_openConnection());

  static final AirQoDatabase _instance = AirQoDatabase._internal();

  @override
  int get schemaVersion => 1;
  Future<List<ForecastInsight>> getForecastInsights(String siteId) =>
      (select(forecastInsights)
            ..where((element) {
              return element.siteId.equals(siteId) &
                  element.frequency.equalsValue(Frequency.hourly) &
                  element.time.isBiggerOrEqualValue(
                    DateTime.now().getDateOfFirstHourOfDay(),
                  ) &
                  element.time.isSmallerOrEqualValue(
                    DateTime.now().tomorrow().getDateOfLastHourOfDay(),
                  );
            }))
          .get();

  Future<List<HistoricalInsight>> getHistoricalInsights({
    required String siteId,
    required Frequency frequency,
  }) {
    DateTime startDateTime;
    DateTime endDateTime;
    switch (frequency) {
      case Frequency.daily:
        startDateTime = DateTime.now()
            .getFirstDateOfCalendarMonth()
            .getDateOfFirstHourOfDay();
        endDateTime = DateTime.now()
            .getLastDateOfCalendarMonth()
            .getDateOfLastHourOfDay();
        break;
      case Frequency.hourly:
        startDateTime =
            DateTime.now().getDateOfFirstDayOfWeek().getDateOfFirstHourOfDay();
        endDateTime =
            DateTime.now().getDateOfLastDayOfWeek().getDateOfLastHourOfDay();
        break;
    }

    return (select(historicalInsights)
          ..where((element) {
            return element.siteId.equals(siteId) &
                element.frequency.equalsValue(frequency) &
                element.time.isBiggerOrEqualValue(startDateTime) &
                element.time.isSmallerOrEqualValue(endDateTime);
          }))
        .get();
  }

  Future<List<HistoricalInsight>> getDailyMiniHourlyInsights(
    String siteId,
    int day,
  ) =>
      (select(historicalInsights)
            ..where((x) {
              return x.siteId.equals(siteId) &
                  x.time.day.equals(day) &
                  x.frequency.equalsValue(Frequency.hourly);
            }))
          .get();

  void deleteOldInsights() {
    DateTime deleteDate =
        DateTime.now().getFirstDateOfCalendarMonth().getDateOfFirstHourOfDay();
    (delete(historicalInsights)
          ..where((i) => i.time.isSmallerThanValue(deleteDate)))
        .go();
    (delete(forecastInsights)
          ..where((i) => i.time.isSmallerThanValue(deleteDate)))
        .go();
  }

  Future<void> insertForecastInsights(List<ForecastInsight> insights) =>
      batch((batch) {
        batch.insertAllOnConflictUpdate(forecastInsights, insights);
      });

  Future<void> insertHistoricalInsights(List<HistoricalInsight> insights) =>
      batch((batch) {
        batch.insertAllOnConflictUpdate(historicalInsights, insights);
      });
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'airqo_app_db.sqlite'));

    return NativeDatabase(file);
  });
}
