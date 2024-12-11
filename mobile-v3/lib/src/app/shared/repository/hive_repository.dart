import 'package:hive/hive.dart';

class HiveBoxNames {
  const HiveBoxNames._();

  static String authBox = "auth";
}

class HiveRepository {
  HiveRepository._();

  static Future<void> saveData(String boxName, String key, value) async {
    var box = await Hive.openBox(boxName);
    await box.put(key, value);
  }

  static Future<dynamic>? getData(String key, String boxName) async {
    var box = await Hive.openBox(boxName);

    var value = box.get(key);

    return value;
  }

  static Future<void>? deleteData(String boxName, String key) async {
    var box = await Hive.openBox(boxName);

    await box.delete(key);
  }
}
