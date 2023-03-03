import 'dart:io';

import 'package:app/models/enum_constants.dart';
import 'package:app/utils/utils.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

abstract class InsightTable extends Table {
  DateTimeColumn get time => dateTime()();
  RealColumn get pm2_5 => real()();
  RealColumn get pm10 => real()();
  BoolColumn get available => boolean().withDefault(const Constant(true))();
  TextColumn get siteId => text()();
  TextColumn get frequency => textEnum<Frequency>()();

  @override
  Set<Column> get primaryKey => {
        siteId,
        frequency,
        time,
      };
}

@DataClassName("ForecastInsight")
class ForecastInsights extends InsightTable {}

@DriftDatabase(tables: [ForecastInsights])
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

  void deleteOldInsights() {
    DateTime deleteDate =
        DateTime.now().getFirstDateOfCalendarMonth().getDateOfFirstHourOfDay();
    (delete(forecastInsights)
          ..where((i) => i.time.isSmallerThanValue(deleteDate)))
        .go();
  }

  Future<void> insertForecastInsights(List<ForecastInsight> insights) =>
      batch((batch) {
        batch.insertAllOnConflictUpdate(forecastInsights, insights);
      });
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(
      p.join(
        dbFolder.path,
        'airqo_app_db.sqlite',
      ),
    ); // TODO delete database

    return NativeDatabase(file);
  });
}
