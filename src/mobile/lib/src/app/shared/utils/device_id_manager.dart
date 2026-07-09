import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class DeviceIdManager {
  static const String _deviceIdKey = 'airqo_device_id';
  static const Uuid _uuid = Uuid();

  /// Returns a persistent per-installation device ID (UUID v4).
  static Future<String> getDeviceId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      var deviceId = prefs.getString(_deviceIdKey);
      if (deviceId == null || deviceId.isEmpty) {
        deviceId = _uuid.v4();
        await prefs.setString(_deviceIdKey, deviceId);
      }
      return deviceId;
    } catch (_) {
      // The Learn API requires a UUIDv4 device_id, so even the
      // non-persistent fallback must be a valid UUID.
      return _uuid.v4();
    }
  }

  /// Clears the stored device ID (useful for testing).
  static Future<void> clearDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_deviceIdKey);
  }
}
