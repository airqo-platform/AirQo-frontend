import 'package:app/models/profile.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/config.dart';
import '../models/enum_constants.dart';
import '../models/notification.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();
    Hive
      ..registerAdapter(AppNotificationAdapter())
      ..registerAdapter(ProfileAdapter())
      ..registerAdapter(AppNotificationTypeAdapter())
      ..registerAdapter(UserPreferencesTypeAdapter());

    await Hive.openBox<AppNotification>(HiveBox.appNotifications);
    await Hive.openBox<Profile>(HiveBox.profile);
  }
}
