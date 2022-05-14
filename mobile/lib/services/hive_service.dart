import 'package:hive_flutter/hive_flutter.dart';

import '../constants/config.dart';
import '../models/notification.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();
    Hive.registerAdapter(AppNotificationAdapter());

    await Hive.openBox<AppNotification>(HiveBox.appNotifications);
  }
}
