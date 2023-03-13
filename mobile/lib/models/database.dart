import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

@DataClassName("Forecast")
class ForecastTable extends Table {
  DateTimeColumn get time => dateTime()();
  RealColumn get pm2_5 => real()();
  TextColumn get siteId => text()();

  @override
  Set<Column> get primaryKey => {
        siteId,
        time,
      };
}

@DriftDatabase(tables: [ForecastTable])
class AirQoDatabase extends _$AirQoDatabase {
  factory AirQoDatabase() {
    return _instance;
  }

  AirQoDatabase._internal() : super(_openConnection());

  static final AirQoDatabase _instance = AirQoDatabase._internal();

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          await m.deleteTable('forecast_insights');
          await m.deleteTable('historical_insights');
        }

        await m.createAll();
      },
    );
  }

  Future<List<Forecast>> getForecast(String siteId) => (select(forecastTable)
        ..where((element) {
          return element.siteId.equals(siteId) &
              element.time.isBiggerThanValue(DateTime.now());
        }))
      .get();

  void deleteOldForecast() {
    (delete(forecastTable)
          ..where((i) => i.time.isSmallerOrEqualValue(DateTime.now())))
        .go();
  }

  Future<void> insertForecast(List<Forecast> forecast) => batch((batch) {
        batch.insertAllOnConflictUpdate(forecastTable, forecast);
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
