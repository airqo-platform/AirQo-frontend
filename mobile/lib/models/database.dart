import 'dart:io';

import 'package:app/models/enum_constants.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../utils/exception.dart';

part 'database.g.dart';

class GraphInsight extends Table {
  DateTimeColumn get time => dateTime()();
  RealColumn get pm2_5 => real()();
  RealColumn get pm10 => real()();
  BoolColumn get empty => boolean().withDefault(const Constant(true))();
  BoolColumn get forecast => boolean().withDefault(const Constant(false))();
  TextColumn get siteId => text()();
  IntColumn get frequency => intEnum<Frequency>()();

  @override
  Set<Column> get primaryKey => {siteId, frequency, time};
}

@DriftDatabase(tables: [GraphInsight])
class AirQoDatabase extends _$AirQoDatabase {
  factory AirQoDatabase() {
    return _instance;
  }

  AirQoDatabase._internal() : super(_openConnection());

  static final AirQoDatabase _instance = AirQoDatabase._internal();

  @override
  int get schemaVersion => 1;

  Future<List<GraphInsightData>> getInsights(
    String siteId,
    Frequency frequency,
  ) async {
    try {
      final data = await (select(graphInsight)
            ..where((x) {
              return x.siteId.equals(siteId);
            }))
          .get();

      return data.where((element) => element.frequency == frequency).toList();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  Future<List<GraphInsightData>> getDailyMiniHourlyInsights(
    String siteId,
    int day,
  ) async {
    try {
      final data = await (select(graphInsight)
            ..where((x) {
              return x.siteId.equals(siteId) & x.time.day.equals(day);
            }))
          .get();

      return data
          .where((element) => element.frequency == Frequency.hourly)
          .toList();
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }

    return [];
  }

  Future<void> insertInsights(List<GraphInsightData> insights) async {
    try {
      await batch((batch) {
        batch.insertAllOnConflictUpdate(graphInsight, insights);
      });
    } catch (exception, stackTrace) {
      await logException(
        exception,
        stackTrace,
      );
    }
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'airqo_app_db.sqlite'));
    return NativeDatabase(file);
  });
}
