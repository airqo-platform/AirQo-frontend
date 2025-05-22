import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:loggy/loggy.dart';
import 'package:battery_plus/battery_plus.dart';

enum CacheBoxName { airQuality, forecast, location, userPreferences }

enum ConnectionType { wifi, mobile, none }

class CachedData<T> {
  final T data;
  final DateTime timestamp;
  final String? etag;
  final bool isValid;

  CachedData({
    required this.data,
    required this.timestamp,
    this.etag,
    this.isValid = true,
  });

  factory CachedData.fromJson(
      Map<String, dynamic> json, T Function(Map<String, dynamic>) fromJson) {
    return CachedData<T>(
      data: fromJson(json['data']),
      timestamp: DateTime.parse(json['timestamp']),
      etag: json['etag'],
      isValid: json['isValid'] ?? true,
    );
  }

  Map<String, dynamic> toJson(Map<String, dynamic> Function(T) toJson) {
    return {
      'data': toJson(data),
      'timestamp': timestamp.toIso8601String(),
      'etag': etag,
      'isValid': isValid,
    };
  }

  CachedData<T> copyWith({
    T? data,
    DateTime? timestamp,
    String? etag,
    bool? isValid,
  }) {
    return CachedData<T>(
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
      etag: etag ?? this.etag,
      isValid: isValid ?? this.isValid,
    );
  }

  bool isStale(Duration refreshInterval) {
    if (!isValid) return true;
    final now = DateTime.now();
    return now.difference(timestamp) > refreshInterval;
  }
}

class RefreshPolicy {
  final Duration wifiInterval;
  final Duration mobileInterval;
  final double? lowBatteryFactor;

  const RefreshPolicy({
    required this.wifiInterval,
    Duration? mobileInterval,
    this.lowBatteryFactor,
  }) : mobileInterval = mobileInterval ?? wifiInterval * 2;

  Duration getInterval(ConnectionType connectionType, bool isLowBattery) {
    Duration baseInterval;

    switch (connectionType) {
      case ConnectionType.wifi:
        baseInterval = wifiInterval;
        break;
      case ConnectionType.mobile:
        baseInterval = mobileInterval;
        break;
      case ConnectionType.none:
        return const Duration(days: 1);
    }

    if (isLowBattery && lowBatteryFactor != null) {
      return baseInterval * lowBatteryFactor!;
    }

    return baseInterval;
  }

  static const RefreshPolicy airQuality = RefreshPolicy(
    wifiInterval: Duration(hours: 1),
    mobileInterval: Duration(hours: 2),
    lowBatteryFactor: 2.0,
  );

  static const RefreshPolicy forecast = RefreshPolicy(
    wifiInterval: Duration(hours: 3),
    mobileInterval: Duration(hours: 6),
    lowBatteryFactor: 2.0
  );

  static const RefreshPolicy location = RefreshPolicy(
    wifiInterval: Duration(hours: 24),
    mobileInterval: Duration(hours: 48),
    lowBatteryFactor: 2.0,
  );

  static const RefreshPolicy userPreferences = RefreshPolicy(
    wifiInterval: Duration(hours: 12),
    mobileInterval: Duration(hours: 24),
  );
}

class CacheManager with UiLoggy {
  static final CacheManager _instance = CacheManager._internal();
  factory CacheManager() => _instance;
  CacheManager._internal();

  final Connectivity _connectivity = Connectivity();
  final Battery _battery = Battery();

  ConnectionType _connectionType = ConnectionType.none;
  bool _isLowBattery = false;

  final StreamController<ConnectionType> _connectionChangeController =
      StreamController<ConnectionType>.broadcast();
  final StreamController<bool> _batteryChangeController =
      StreamController<bool>.broadcast();

  Stream<ConnectionType> get connectionChange =>
      _connectionChangeController.stream;
  Stream<bool> get batteryChange => _batteryChangeController.stream;

  Future<void> initialize() async {
    loggy.info('Initializing CacheManager');

    await _initializeHiveBoxes();

    _connectivity.onConnectivityChanged.listen(_updateConnectionType as void Function(List<ConnectivityResult> event)?);
    _updateConnectionType((await _connectivity.checkConnectivity()) as ConnectivityResult);

    _battery.onBatteryStateChanged.listen(_updateBatteryState);
    _updateBatteryState(await _battery.batteryState);

    loggy.info('CacheManager initialized successfully');
  }

  Future<void> _initializeHiveBoxes() async {
    try {
      await Hive.initFlutter();

      // Open boxes if not already open
      if (!Hive.isBoxOpen(CacheBoxName.airQuality.toString())) {
        await Hive.openBox(CacheBoxName.airQuality.toString());
      }
      if (!Hive.isBoxOpen(CacheBoxName.forecast.toString())) {
        await Hive.openBox(CacheBoxName.forecast.toString());
      }
      if (!Hive.isBoxOpen(CacheBoxName.location.toString())) {
        await Hive.openBox(CacheBoxName.location.toString());
      }
      if (!Hive.isBoxOpen(CacheBoxName.userPreferences.toString())) {
        await Hive.openBox(CacheBoxName.userPreferences.toString());
      }

      loggy.info('Hive boxes initialized');
    } catch (e) {
      loggy.error('Error initializing Hive boxes: $e');
      rethrow;
    }
  }

  void _updateConnectionType(ConnectivityResult connectivityResult) {
    ConnectionType prevConnectionType = _connectionType;

    switch (connectivityResult) {
      case ConnectivityResult.wifi:
        _connectionType = ConnectionType.wifi;
        break;
      case ConnectivityResult.mobile:
        _connectionType = ConnectionType.mobile;
        break;
      default:
        _connectionType = ConnectionType.none;
    }

    if (prevConnectionType != _connectionType) {
      loggy.info('Connection type changed: $_connectionType');
      _connectionChangeController.add(_connectionType);
    }
  }

  void _updateBatteryState(BatteryState batteryState) async {
    if (batteryState == BatteryState.charging) {
      _isLowBattery = false;
    } else {
      int batteryLevel = await _battery.batteryLevel;
      bool newIsLowBattery = batteryLevel <= 20;

      if (_isLowBattery != newIsLowBattery) {
        _isLowBattery = newIsLowBattery;
        loggy
            .info('Battery state changed: ${_isLowBattery ? "Low" : "Normal"}');
        _batteryChangeController.add(_isLowBattery);
      }
    }
  }

  ConnectionType get connectionType => _connectionType;

  bool get isLowBattery => _isLowBattery;

  bool get isConnected => _connectionType != ConnectionType.none;

  Future<void> put<T>({
    required CacheBoxName boxName,
    required String key,
    required T data,
    required Map<String, dynamic> Function(T) toJson,
    String? etag,
  }) async {
    try {
      final box = Hive.box(boxName.toString());

      final cachedData = CachedData<T>(
        data: data,
        timestamp: DateTime.now(),
        etag: etag,
      );

      final jsonData = cachedData.toJson(toJson);
      await box.put(key, json.encode(jsonData));

      loggy.info('Data cached successfully: ${boxName.toString()}/$key');
    } catch (e) {
      loggy.error('Error caching data: $e');
    }
  }

  Future<CachedData<T>?> get<T>({
    required CacheBoxName boxName,
    required String key,
    required T Function(Map<String, dynamic>) fromJson,
  }) async {
    try {
      final box = Hive.box(boxName.toString());
      final cachedJson = box.get(key);

      if (cachedJson == null) {
        return null;
      }

      final decoded = json.decode(cachedJson);
      final cachedData = CachedData<T>.fromJson(decoded, fromJson);

      loggy.info(
          'Retrieved from cache: ${boxName.toString()}/$key (${DateTime.now().difference(cachedData.timestamp).inMinutes} minutes old)');

      return cachedData;
    } catch (e) {
      loggy.error('Error retrieving from cache: $e');
      return null;
    }
  }

  bool shouldRefresh<T>({
    required CacheBoxName boxName,
    required String key,
    required RefreshPolicy policy,
    required CachedData<T>? cachedData,
    bool forceRefresh = false,
  }) {
    if (forceRefresh) {
      return true;
    }

    if (cachedData == null) {
      return true;
    }

    final refreshInterval = policy.getInterval(_connectionType, _isLowBattery);
    return cachedData.isStale(refreshInterval);
  }

  Future<void> delete({
    required CacheBoxName boxName,
    required String key,
  }) async {
    try {
      final box = Hive.box(boxName.toString());
      await box.delete(key);
      loggy.info('Deleted from cache: ${boxName.toString()}/$key');
    } catch (e) {
      loggy.error('Error deleting from cache: $e');
    }
  }

  Future<void> clearBox(CacheBoxName boxName) async {
    try {
      final box = Hive.box(boxName.toString());
      await box.clear();
      loggy.info('Cleared cache box: ${boxName.toString()}');
    } catch (e) {
      loggy.error('Error clearing cache box: $e');
    }
  }

  Future<void> clearAll() async {
    try {
      await clearBox(CacheBoxName.airQuality);
      await clearBox(CacheBoxName.forecast);
      await clearBox(CacheBoxName.location);
      await clearBox(CacheBoxName.userPreferences);
      loggy.info('Cleared all cache boxes');
    } catch (e) {
      loggy.error('Error clearing all cache boxes: $e');
    }
  }

  void dispose() {
    _connectionChangeController.close();
    _batteryChangeController.close();
  }
}
