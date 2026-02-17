import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:loggy/loggy.dart';
import 'package:synchronized/synchronized.dart';

class SecureLocationStorage with UiLoggy {
  static final SecureLocationStorage _instance = SecureLocationStorage._internal();
  factory SecureLocationStorage() => _instance;
  SecureLocationStorage._internal();

  static const String _encryptionKeyName = 'location_storage_key';
  static const String _locationBoxName = 'secure_location_box';
  static const String _privacyZonesKey = 'privacy_zones';
  static const String _locationHistoryKey = 'location_history';
  static const String _trackingSettingsKey = 'tracking_settings';
  
  static const int _maxHistoryEntries = 10000;
  static const Duration _maxHistoryAge = Duration(days: 90);

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  Box? _secureBox;
  final Lock _boxLock = Lock();

  Future<Box> _getSecureBox() async {
    return _boxLock.synchronized(() async {
      if (_secureBox != null && _secureBox!.isOpen) {
        return _secureBox!;
      }

      final encryptionKey = await _getOrCreateEncryptionKey();
      _secureBox = await Hive.openBox(
        _locationBoxName,
        encryptionCipher: HiveAesCipher(encryptionKey),
      );
      
      return _secureBox!;
    });
  }

  Future<Uint8List> _getOrCreateEncryptionKey() async {
    try {
      final existingKey = await _secureStorage.read(key: _encryptionKeyName);
      
      if (existingKey != null) {
        return base64.decode(existingKey);
      }

      final newKey = Uint8List.fromList(Hive.generateSecureKey());
      await _secureStorage.write(
        key: _encryptionKeyName,
        value: base64.encode(newKey),
      );
      
      loggy.info('Generated new encryption key for location storage');
      return newKey;
    } catch (e) {
      loggy.error('Error managing encryption key: $e');
      rethrow;
    }
  }

  Future<void> savePrivacyZones(List<Map<String, dynamic>> zones) async {
    try {
      final box = await _getSecureBox();
      await box.put(_privacyZonesKey, zones);
      loggy.info('Saved ${zones.length} privacy zones securely');
    } catch (e) {
      loggy.error('Error saving privacy zones: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getPrivacyZones() async {
    try {
      final box = await _getSecureBox();
      final zones = box.get(_privacyZonesKey, defaultValue: <Map<String, dynamic>>[]);
      return List<Map<String, dynamic>>.from(zones);
    } catch (e) {
      loggy.error('Error loading privacy zones: $e');
      return [];
    }
  }

  Future<void> saveLocationHistory(List<Map<String, dynamic>> history) async {
    try {
      // Apply data retention policies before saving
      final cleanedHistory = _applyDataRetention(history);
      
      final box = await _getSecureBox();
      await box.put(_locationHistoryKey, cleanedHistory);
      
      if (cleanedHistory.length != history.length) {
        loggy.info('Applied data retention: ${history.length} -> ${cleanedHistory.length} entries');
      }
      
      loggy.info('Saved ${cleanedHistory.length} location history entries securely');
    } catch (e) {
      loggy.error('Error saving location history: $e');
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getLocationHistory() async {
    try {
      final box = await _getSecureBox();
      final history = box.get(_locationHistoryKey, defaultValue: <Map<String, dynamic>>[]);
      return List<Map<String, dynamic>>.from(history);
    } catch (e) {
      loggy.error('Error loading location history: $e');
      return [];
    }
  }

  Future<void> saveTrackingSettings(Map<String, dynamic> settings) async {
    try {
      final box = await _getSecureBox();
      await box.put(_trackingSettingsKey, settings);
      loggy.info('Saved tracking settings securely');
    } catch (e) {
      loggy.error('Error saving tracking settings: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getTrackingSettings() async {
    try {
      final box = await _getSecureBox();
      final settings = box.get(_trackingSettingsKey, defaultValue: <String, dynamic>{});
      return Map<String, dynamic>.from(settings);
    } catch (e) {
      loggy.error('Error loading tracking settings: $e');
      return {};
    }
  }

  List<Map<String, dynamic>> _applyDataRetention(List<Map<String, dynamic>> history) {
    final now = DateTime.now();
    final cutoffDate = now.subtract(_maxHistoryAge);
    
    // Filter out entries older than retention period
    var filteredHistory = history.where((entry) {
      try {
        final timestamp = DateTime.parse(entry['timestamp']);
        return timestamp.isAfter(cutoffDate);
      } catch (e) {
        loggy.warning('Invalid timestamp in history entry: ${entry['timestamp']}');
        return false;
      }
    }).toList();

    // Sort by timestamp (newest first) and limit to max entries
    filteredHistory.sort((a, b) {
      try {
        final timestampA = DateTime.parse(a['timestamp']);
        final timestampB = DateTime.parse(b['timestamp']);
        return timestampB.compareTo(timestampA);
      } catch (e) {
        return 0;
      }
    });

    if (filteredHistory.length > _maxHistoryEntries) {
      filteredHistory = filteredHistory.take(_maxHistoryEntries).toList();
    }

    return filteredHistory;
  }

  Future<void> deleteLocationPoint(String pointId) async {
    try {
      final history = await getLocationHistory();
      history.removeWhere((point) => point['id'] == pointId);
      await saveLocationHistory(history);
      loggy.info('Deleted location point: $pointId');
    } catch (e) {
      loggy.error('Error deleting location point: $e');
      rethrow;
    }
  }

  Future<void> deleteLocationPointsInRange(DateTime start, DateTime end) async {
    try {
      final history = await getLocationHistory();
      history.removeWhere((point) {
        try {
          final timestamp = DateTime.parse(point['timestamp']);
          return timestamp.isAfter(start.subtract(Duration(milliseconds: 1))) &&
                 timestamp.isBefore(end.add(Duration(milliseconds: 1)));
        } catch (e) {
          return false;
        }
      });
      await saveLocationHistory(history);
      loggy.info('Deleted location points between $start and $end');
    } catch (e) {
      loggy.error('Error deleting location points in range: $e');
      rethrow;
    }
  }

  Future<void> removePrivacyZone(String zoneId) async {
    try {
      final zones = await getPrivacyZones();
      zones.removeWhere((zone) => zone['id'] == zoneId);
      await savePrivacyZones(zones);
      loggy.info('Removed privacy zone: $zoneId');
    } catch (e) {
      loggy.error('Error removing privacy zone: $e');
      rethrow;
    }
  }

  Future<void> clearAllData() async {
    try {
      final box = await _getSecureBox();
      await box.clear();
      loggy.info('Cleared all secure location data');
    } catch (e) {
      loggy.error('Error clearing all data: $e');
      rethrow;
    }
  }

  Future<void> dispose() async {
    try {
      await _secureBox?.close();
      _secureBox = null;
      loggy.info('Disposed secure location storage');
    } catch (e) {
      loggy.error('Error disposing secure location storage: $e');
    }
  }

  int get maxHistoryEntries => _maxHistoryEntries;
  Duration get maxHistoryAge => _maxHistoryAge;
}