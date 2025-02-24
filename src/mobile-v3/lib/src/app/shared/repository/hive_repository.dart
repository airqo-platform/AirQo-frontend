import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';

class HiveBoxNames {
  const HiveBoxNames._();

  static String authBox = "auth";
}

class HiveRepository {
  HiveRepository._();

  static Future<dynamic> saveData(String boxName, String key, dynamic value) async {
    var box = await Hive.openBox(boxName);
    await box.put(key, value);
    return value;
  }

  static Future<String?> getData(String key, String boxName) async {
    try {
      var box = await Hive.openBox(boxName);
      var value = box.get(key);
      return value is String ? value : null;
    } catch (e) {
      logError('Error retrieving data from Hive: $e');
      return null;
    }
  }

  static Future<void>? deleteData(String boxName, String key) async {
    var box = await Hive.openBox(boxName);

    await box.delete(key);
  }
}
