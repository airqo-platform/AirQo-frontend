import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class DeviceIdManager {
  static const String _deviceIdKey = 'airqo_device_id';
  static const Uuid _uuid = Uuid();

  /// Returns the persistent device ID, generating one on first call.
  static Future<String> getDeviceId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? deviceId = prefs.getString(_deviceIdKey);

      if (deviceId == null || deviceId.isEmpty) {
        deviceId = _uuid.v4();
        await prefs.setString(_deviceIdKey, deviceId);
      }

      return deviceId;
    } catch (e) {
      // Fallback: session-only ID that satisfies the 10-100 char requirement.
      return 'temp-${DateTime.now().millisecondsSinceEpoch}';
    }
  }

  /// Clears the stored device ID (useful for testing).
  static Future<void> clearDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_deviceIdKey);
  }
}
