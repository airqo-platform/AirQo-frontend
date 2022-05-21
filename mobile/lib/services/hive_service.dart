import 'dart:convert';
import 'dart:typed_data';

import 'package:app/models/profile.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/config.dart';
import '../models/enum_constants.dart';
import '../models/notification.dart';

class HiveService {
  static Future<void> initialize() async {
    await Hive.initFlutter();
    final encryptionKey = await getEncryptionKey();

    Hive
      ..registerAdapter(AppNotificationAdapter())
      ..registerAdapter(ProfileAdapter())
      ..registerAdapter(AppNotificationTypeAdapter())
      ..registerAdapter(UserPreferencesTypeAdapter());

    await Hive.openBox<AppNotification>(HiveBox.appNotifications);
    await Hive.openBox<Profile>(HiveBox.profile,
        encryptionCipher: HiveAesCipher(encryptionKey));
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
}
