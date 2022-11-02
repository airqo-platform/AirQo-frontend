import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:flutter/material.dart';
import 'package:path/path.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

class DBHelper {
  factory DBHelper() {
    return _instance;
  }
  DBHelper._internal();
  static final DBHelper _instance = DBHelper._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDB();
    await createDefaultTables(_database!);

    return _database!;
  }

  Future<void> createDefaultTables(Database db) async {
    final prefs = await SharedPreferences.getInstance();
    final createDatabases = prefs.getBool(Config.prefReLoadDb) ?? true;

    final batch = db.batch();

    if (createDatabases) {
      batch.execute(Insights.dropTableStmt());
      await prefs.setBool(Config.prefReLoadDb, false);
    }

    batch.execute(Insights.createTableStmt());

    await batch.commit(noResult: true, continueOnError: true);
  }

  Future<List<Insights>> getInsights(String siteId, Frequency frequency) async {
    try {
      final db = await database;

      final res = await db.query(
        Insights.dbName(),
        where: 'siteId = ? and frequency = ?',
        whereArgs: [siteId, frequency.toString()],
      );

      return res.isNotEmpty
          ? List.generate(
              res.length,
              (i) {
                return Insights.fromJson(res[i]);
              },
            )
          : <Insights>[];
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');

      return <Insights>[];
    }
  }

  Future<Database> initDB() async {
    return await openDatabase(
      join(await getDatabasesPath(), Config.dbName),
      version: 1,
      onCreate: (db, version) {
        createDefaultTables(db);
      },
      // onUpgrade: (db, oldVersion, newVersion){
      //   createDefaultTables(db);
      // },
    );
  }

  Future<void> insertInsights(
    List<Insights> insights,
    List<String> siteIds, {
    bool reloadDatabase = false,
  }) async {
    try {
      final db = await database;

      if (insights.isEmpty) {
        return;
      }
      final batch = db.batch();

      if (reloadDatabase) {
        batch.delete(Insights.dbName());
      } else {
        for (final siteId in siteIds) {
          batch.delete(
            Insights.dbName(),
            where: 'siteId = ?',
            whereArgs: [siteId],
          );
        }
      }

      for (final row in insights) {
        try {
          final jsonData = row.toJson();
          batch.insert(
            Insights.dbName(),
            jsonData,
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        } catch (exception, stackTrace) {
          debugPrint('$exception\n$stackTrace');
        }
      }
      await batch.commit(noResult: true, continueOnError: true);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
}

class SharedPreferencesHelper {
  static Future<void> clearPreferences() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    if (sharedPreferences.containsKey('notifications')) {
      await sharedPreferences.remove('notifications');
    }
    if (sharedPreferences.containsKey('aqShares')) {
      await sharedPreferences.remove('aqShares');
    }
    if (sharedPreferences.containsKey('location')) {
      await sharedPreferences.remove('location');
    }
    if (sharedPreferences.containsKey('alerts')) {
      await sharedPreferences.remove('alerts');
    }
  }

  static Future<String> getOnBoardingPage() async {
    final sharedPreferences = await SharedPreferences.getInstance();

    return sharedPreferences.getString(Config.prefOnBoardingPage) ?? 'welcome';
  }

  static Future<UserPreferences> getPreferences() async {
    final sharedPreferences = await SharedPreferences.getInstance();
    final notifications = sharedPreferences.getBool('notifications') ?? false;
    final location = sharedPreferences.getBool('location') ?? false;
    final aqShares = sharedPreferences.getInt('aqShares') ?? 0;

    return UserPreferences(
      location: location,
      notifications: notifications,
      aqShares: aqShares,
    );
  }

  static Future<void> updateOnBoardingPage(
    OnBoardingPage currentBoardingPage,
  ) async {
    final sharedPreferences = await SharedPreferences.getInstance();
    await sharedPreferences.setString(
      Config.prefOnBoardingPage,
      currentBoardingPage.toString(),
    );
  }

  static Future<void> updatePreference(
    String key,
    dynamic value,
    String type,
  ) async {
    try {
      final sharedPreferences = await SharedPreferences.getInstance();
      if (type == 'bool') {
        await sharedPreferences.setBool(key, value as bool);
      } else if (type == 'double') {
        await sharedPreferences.setDouble(key, value as double);
      } else if (type == 'int') {
        await sharedPreferences.setInt(key, value as int);
      } else {
        await sharedPreferences.setString(key, value as String);
      }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
  }
}
