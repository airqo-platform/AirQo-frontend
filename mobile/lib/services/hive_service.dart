import 'dart:convert';
import 'dart:typed_data';

import 'package:app/models/profile.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/config.dart';
import '../models/analytics.dart';
import '../models/enum_constants.dart';
import '../models/kya.dart';
import '../models/notification.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();

    Hive
      ..registerAdapter(AppNotificationAdapter())
      ..registerAdapter(ProfileAdapter())
      ..registerAdapter(KyaAdapter())
      ..registerAdapter(AnalyticsAdapter())
      ..registerAdapter(AppNotificationTypeAdapter())
      ..registerAdapter(KyaLessonAdapter())
      ..registerAdapter(UserPreferencesTypeAdapter());

    final encryptionKey = await getEncryptionKey();

    await Future.wait([
      Hive.openBox<AppNotification>(HiveBox.appNotifications),
      Hive.openBox<Kya>(HiveBox.kya),
      Hive.openBox<Analytics>(HiveBox.analytics),
      Hive.openBox<Profile>(HiveBox.profile,
          encryptionCipher: HiveAesCipher(encryptionKey))
    ]);
  }

  static Future<Uint8List> getEncryptionKey() async {
    const secureStorage = FlutterSecureStorage();
    var encodedKey = await secureStorage.read(key: HiveBox.encryptionKey);
    if (encodedKey == null) {
      final secureKey = Hive.generateSecureKey();
      await secureStorage.write(
        key: HiveBox.encryptionKey,
        value: base64UrlEncode(secureKey),
      );
    }
    encodedKey = await secureStorage.read(key: HiveBox.encryptionKey);
    return base64Url.decode(encodedKey!);
  }

  static Future<void> clearUserData() async {
    await Future.wait([
      Hive.box<AppNotification>(HiveBox.appNotifications).clear(),
      Hive.box<Profile>(HiveBox.profile).clear(),
      Hive.box<Analytics>(HiveBox.analytics).clear(),
      Hive.box<Kya>(HiveBox.kya).clear()
    ]);
  }
}
