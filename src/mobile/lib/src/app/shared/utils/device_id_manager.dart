import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class DeviceIdManager {
  static const String _deviceIdKey = 'airqo_device_id';
  static const Uuid _uuid = Uuid();

  /// Returns a persistent device ID.
  /// On Android, uses ANDROID_ID which survives app reinstalls.
  /// Falls back to a UUID stored in SharedPreferences.
  static Future<String> getDeviceId() async {
    try {
      if (defaultTargetPlatform == TargetPlatform.android) {
        final androidInfo = await DeviceInfoPlugin().androidInfo;
        final androidId = androidInfo.id;
        if (androidId.isNotEmpty) {
          return androidId;
        }
      }

      // Fallback: UUID persisted in SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);

      if (deviceId == null || deviceId.isEmpty) {
        deviceId = _uuid.v4();
        await prefs.setString(_deviceIdKey, deviceId);
      }

      return deviceId;
    } catch (e) {
      return 'temp-${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  /// Clears the stored device ID (useful for testing).
  static Future<void> clearDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_deviceIdKey);
  }
}
