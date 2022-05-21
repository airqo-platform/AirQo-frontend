import 'package:hive_flutter/hive_flutter.dart';

import '../constants/config.dart';
import '../models/enum_constants.dart';
import '../models/notification.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();
    Hive
      ..registerAdapter(AppNotificationAdapter())
      ..registerAdapter(AppNotificationTypeAdapter());

    await Hive.openBox<AppNotification>(HiveBox.appNotifications);
  }
}
