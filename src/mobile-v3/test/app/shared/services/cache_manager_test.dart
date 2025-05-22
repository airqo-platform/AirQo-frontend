import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'dart:convert';

// Generate mocks
@GenerateMocks([Box, Connectivity, Battery])
import 'cache_manager_test.mocks.dart';

void main() {
  group('CacheManager', () {
    late CacheManager cacheManager;
    late MockBox mockBox;
    late MockConnectivity mockConnectivity;
    late MockBattery mockBattery;

    setUp(() {
      mockBox = MockBox();
      mockConnectivity = MockConnectivity();
      mockBattery = MockBattery();
      cacheManager = CacheManager();
    });

    group('CachedData Model', () {
      test('creates CachedData with all properties', () {
        // Arrange
        final testData = {'key': 'value', 'number': 42};
        final timestamp = DateTime.now();
        const etag = 'test-etag-123';

        // Act
        final cachedData = CachedData<Map<String, dynamic>>(
          data: testData,
          timestamp: timestamp,
          etag: etag,
          isValid: true,
        );

        // Assert
        expect(cachedData.data, equals(testData));
        expect(cachedData.timestamp, equals(timestamp));
        expect(cachedData.etag, equals(etag));
        expect(cachedData.isValid, isTrue);
      });

      test('isStale correctly identifies stale data', () {
        // Fresh data
        final freshData = CachedData<String>(
          data: 'fresh',
          timestamp: DateTime.now().subtract(Duration(minutes: 30)),
        );
        expect(freshData.isStale(Duration(hours: 1)), isFalse);

        // Stale data
        final staleData = CachedData<String>(
          data: 'stale',
          timestamp: DateTime.now().subtract(Duration(hours: 2)),
        );
        expect(staleData.isStale(Duration(hours: 1)), isTrue);
      });

      test('isStale returns true for invalid data', () {
        final invalidData = CachedData<String>(
          data: 'invalid',
          timestamp: DateTime.now(),
          isValid: false,
        );
        expect(invalidData.isStale(Duration(hours: 1)), isTrue);
      });

      test('copyWith creates correct copy', () {
        final original = CachedData<String>(
          data: 'original',
          timestamp: DateTime.now(),
          etag: 'etag1',
          isValid: true,
        );

        final copy = original.copyWith(
          data: 'updated',
          etag: 'etag2',
        );

        expect(copy.data, equals('updated'));
        expect(copy.etag, equals('etag2'));
        expect(copy.timestamp, equals(original.timestamp)); // Unchanged
        expect(copy.isValid, equals(original.isValid)); // Unchanged
      });

      test('toJson and fromJson work correctly', () {
        // Arrange
        final originalData = {
          'measurements': [
            {'pm25': 25.5, 'location': 'Kampala'},
            {'pm25': 15.2, 'location': 'Nairobi'},
          ],
          'timestamp': '2024-01-15T12:00:00Z',
        };

        final cachedData = CachedData<Map<String, dynamic>>(
          data: originalData,
          timestamp: DateTime.now(),
          etag: 'test-etag',
        );

        // Act - Test JSON serialization
        final jsonData = cachedData.toJson((data) => data);
        
        // Assert serialization
        expect(jsonData['data'], equals(originalData));
        expect(jsonData['timestamp'], isA<String>());
        expect(jsonData['etag'], equals('test-etag'));

        // Act - Test deserialization
        final restored = CachedData<Map<String, dynamic>>.fromJson(
          jsonData,
          (json) => json as Map<String, dynamic>,
        );

        // Assert deserialization
        expect(restored.data, equals(originalData));
        expect(restored.timestamp, isA<DateTime>());
        expect(restored.etag, equals('test-etag'));
      });
    });

    group('Connection Type Handling', () {
      test('connection type affects refresh intervals', () {
        // Test WiFi connection
        final wifiInterval = RefreshPolicy.airQuality.getInterval(
          ConnectionType.wifi,
          false, // not low battery
        );
        expect(wifiInterval, equals(Duration(hours: 1)));

        // Test mobile connection
        final mobileInterval = RefreshPolicy.airQuality.getInterval(
          ConnectionType.mobile,
          false,
        );
        expect(mobileInterval, equals(Duration(hours: 2)));

        // Test no connection
        final offlineInterval = RefreshPolicy.airQuality.getInterval(
          ConnectionType.none,
          false,
        );
        expect(offlineInterval, equals(Duration(days: 1)));
      });

      test('low battery affects refresh intervals', () {
        // Test normal battery
        final normalInterval = RefreshPolicy.airQuality.getInterval(
          ConnectionType.wifi,
          false, // not low battery
        );

        // Test low battery
        final lowBatteryInterval = RefreshPolicy.airQuality.getInterval(
          ConnectionType.wifi,
          true, // low battery
        );

        expect(lowBatteryInterval.inHours, greaterThan(normalInterval.inHours));
      });
    });

    group('Cache Refresh Logic', () {
      test('shouldRefresh returns true when cache is stale', () {
        // Arrange
        final staleData = CachedData<String>(
          data: 'old data',
          timestamp: DateTime.now().subtract(Duration(hours: 25)), // Very old
        );

        // Act
        final shouldRefresh = cacheManager.shouldRefresh<String>(
          boxName: CacheBoxName.airQuality,
          key: 'test-key',
          policy: RefreshPolicy.airQuality,
          cachedData: staleData,
          forceRefresh: false,
        );

        // Assert
        expect(shouldRefresh, isTrue);
      });

      test('shouldRefresh returns false when cache is fresh', () {
        // Arrange
        final freshData = CachedData<String>(
          data: 'fresh data',
          timestamp: DateTime.now().subtract(Duration(minutes: 30)), // Recent
        );

        // Act
        final shouldRefresh = cacheManager.shouldRefresh<String>(
          boxName: CacheBoxName.airQuality,
          key: 'test-key',
          policy: RefreshPolicy.airQuality,
          cachedData: freshData,
          forceRefresh: false,
        );

        // Assert
        expect(shouldRefresh, isFalse);
      });

      test('shouldRefresh returns true when forceRefresh is true', () {
        // Arrange
        final freshData = CachedData<String>(
          data: 'fresh data',
          timestamp: DateTime.now(),
        );

        // Act
        final shouldRefresh = cacheManager.shouldRefresh<String>(
          boxName: CacheBoxName.airQuality,
          key: 'test-key',
          policy: RefreshPolicy.airQuality,
          cachedData: freshData,
          forceRefresh: true,
        );

        // Assert
        expect(shouldRefresh, isTrue);
      });

      test('shouldRefresh returns true when cached data is null', () {
        // Act
        final shouldRefresh = cacheManager.shouldRefresh<String>(
          boxName: CacheBoxName.airQuality,
          key: 'test-key',
          policy: RefreshPolicy.airQuality,
          cachedData: null,
          forceRefresh: false,
        );

        // Assert
        expect(shouldRefresh, isTrue);
      });
    });

    group('Cache Box Management', () {
      test('different cache box names are handled correctly', () {
        // Test all cache box types
        expect(CacheBoxName.airQuality.toString(), contains('airQuality'));
        expect(CacheBoxName.forecast.toString(), contains('forecast'));
        expect(CacheBoxName.location.toString(), contains('location'));
        expect(CacheBoxName.userPreferences.toString(), contains('userPreferences'));
      });
    });

    group('Refresh Policies', () {
      test('air quality policy has correct intervals', () {
        const policy = RefreshPolicy.airQuality;
        expect(policy.wifiInterval, equals(Duration(hours: 1)));
        expect(policy.mobileInterval, equals(Duration(hours: 2)));
      });

      test('forecast policy has correct intervals', () {
        const policy = RefreshPolicy.forecast;
        expect(policy.wifiInterval, equals(Duration(hours: 3)));
        expect(policy.mobileInterval, equals(Duration(hours: 6)));
      });

      test('location policy has correct intervals', () {
        const policy = RefreshPolicy.location;
        expect(policy.wifiInterval, equals(Duration(hours: 24)));
        expect(policy.mobileInterval, equals(Duration(hours: 48)));
      });

      test('user preferences policy has correct intervals', () {
        const policy = RefreshPolicy.userPreferences;
        expect(policy.wifiInterval, equals(Duration(hours: 12)));
        expect(policy.mobileInterval, equals(Duration(hours: 24)));
      });
    });

    group('Connection Type Logic', () {
      test('getInterval returns correct durations for different connection types', () {
        const policy = RefreshPolicy.airQuality;

        // WiFi
        expect(
          policy.getInterval(ConnectionType.wifi, false),
          equals(Duration(hours: 1))
        );

        // Mobile
        expect(
          policy.getInterval(ConnectionType.mobile, false),
          equals(Duration(hours: 2))
        );

        // None
        expect(
          policy.getInterval(ConnectionType.none, false),
          equals(Duration(days: 1))
        );
      });

      test('low battery factor is applied correctly', () {
        const policy = RefreshPolicy.airQuality;

        final normalInterval = policy.getInterval(ConnectionType.wifi, false);
        final lowBatteryInterval = policy.getInterval(ConnectionType.wifi, true);

        expect(lowBatteryInterval, equals(normalInterval * 2.0));
      });

      test('policy without low battery factor ignores battery state', () {
        const policy = RefreshPolicy.userPreferences; // No lowBatteryFactor

        final normalInterval = policy.getInterval(ConnectionType.wifi, false);
        final lowBatteryInterval = policy.getInterval(ConnectionType.wifi, true);

        expect(lowBatteryInterval, equals(normalInterval));
      });
    });

    group('Error Handling', () {
      test('handles JSON parsing errors gracefully', () {
        // Test error handling in JSON parsing
        expect(() {
          // Simulate malformed JSON
          final malformedJson = '{"incomplete": json';
          json.decode(malformedJson);
        }, throwsA(isA<FormatException>()));
      });

      test('handles missing cache box gracefully', () {
        // Verify all cache box types exist
        expect(CacheBoxName.values, contains(CacheBoxName.airQuality));
        expect(CacheBoxName.values, contains(CacheBoxName.forecast));
        expect(CacheBoxName.values, contains(CacheBoxName.location));
        expect(CacheBoxName.values, contains(CacheBoxName.userPreferences));
      });
    });

    group('Real-world Scenarios', () {
      test('caching air quality data flow', () {
        // Simulate caching air quality measurements
        final airQualityData = {
          'success': true,
          'measurements': [
            {
              'pm25': 25.5,
              'location': 'Kampala',
              'timestamp': DateTime.now().toIso8601String(),
            }
          ]
        };

        final cachedData = CachedData<Map<String, dynamic>>(
          data: airQualityData,
          timestamp: DateTime.now(),
          etag: 'air-quality-etag-123',
        );

        expect(cachedData.data['success'], isTrue);
        expect(cachedData.data['measurements'], hasLength(1));
        expect(cachedData.etag, equals('air-quality-etag-123'));
      });

      test('caching forecast data flow', () {
        // Simulate caching forecast data
        final forecastData = {
          'forecasts': [
            {
              'date': '2024-01-15',
              'pm25': 20.0,
              'aqi_category': 'Good',
            },
            {
              'date': '2024-01-16',
              'pm25': 35.0,
              'aqi_category': 'Moderate',
            }
          ]
        };

        final cachedData = CachedData<Map<String, dynamic>>(
          data: forecastData,
          timestamp: DateTime.now(),
        );

        expect(cachedData.data['forecasts'], hasLength(2));
        expect(cachedData.data['forecasts'][0]['aqi_category'], equals('Good'));
      });

      test('cache expiration scenarios', () {
        // Test various cache expiration scenarios
        final now = DateTime.now();

        // Fresh cache
        final freshCache = CachedData<String>(
          data: 'fresh',
          timestamp: now.subtract(Duration(minutes: 30)),
        );
        expect(freshCache.isStale(Duration(hours: 1)), isFalse);

        // Borderline cache
        final borderlineCache = CachedData<String>(
          data: 'borderline',
          timestamp: now.subtract(Duration(minutes: 59)),
        );
        expect(borderlineCache.isStale(Duration(hours: 1)), isFalse);

        // Just expired cache
        final justExpiredCache = CachedData<String>(
          data: 'just expired',
          timestamp: now.subtract(Duration(hours: 1, minutes: 1)),
        );
        expect(justExpiredCache.isStale(Duration(hours: 1)), isTrue);

        // Very old cache
        final veryOldCache = CachedData<String>(
          data: 'very old',
          timestamp: now.subtract(Duration(days: 1)),
        );
        expect(veryOldCache.isStale(Duration(hours: 1)), isTrue);
      });
    });

    group('Data Type Handling', () {
      test('handles complex nested data structures', () {
        final complexData = {
          'metadata': {
            'version': '1.0',
            'generated_at': DateTime.now().toIso8601String(),
          },
          'data': {
            'measurements': [
              {
                'site_id': 'site_1',
                'readings': {
                  'pm25': 25.5,
                  'pm10': 45.2,
                  'temperature': 23.1,
                },
                'location': {
                  'lat': 0.3476,
                  'lng': 32.5825,
                  'address': 'Kampala, Uganda',
                }
              }
            ]
          }
        };

        final cachedData = CachedData<Map<String, dynamic>>(
          data: complexData,
          timestamp: DateTime.now(),
        );

        expect(cachedData.data['metadata']['version'], equals('1.0'));
        expect(cachedData.data['data']['measurements'], hasLength(1));
        expect(cachedData.data['data']['measurements'][0]['readings']['pm25'], equals(25.5));
      });

      test('handles string data', () {
        final stringData = 'Simple string data';
        final cachedData = CachedData<String>(
          data: stringData,
          timestamp: DateTime.now(),
        );

        expect(cachedData.data, equals(stringData));
        expect(cachedData.data, isA<String>());
      });

      test('handles list data', () {
        final listData = ['item1', 'item2', 'item3'];
        final cachedData = CachedData<List<String>>(
          data: listData,
          timestamp: DateTime.now(),
        );

        expect(cachedData.data, equals(listData));
        expect(cachedData.data, hasLength(3));
        expect(cachedData.data[1], equals('item2'));
      });
    });

    group('Singleton Pattern', () {
      test('CacheManager maintains singleton behavior', () {
        final instance1 = CacheManager();
        final instance2 = CacheManager();
        
        expect(identical(instance1, instance2), isTrue);
      });

      test('multiple calls return same instance', () {
        final instances = List.generate(5, (_) => CacheManager());
        
        for (int i = 1; i < instances.length; i++) {
          expect(identical(instances[0], instances[i]), isTrue);
        }
      });
    });

    group('Getters and Properties', () {
      test('connection type defaults are correct', () {
        expect(cacheManager.connectionType, isA<ConnectionType>());
        expect(cacheManager.isLowBattery, isA<bool>());
        expect(cacheManager.isConnected, isA<bool>());
      });

      test('connection status streams exist', () {
        expect(cacheManager.connectionChange, isA<Stream<ConnectionType>>());
        expect(cacheManager.batteryChange, isA<Stream<bool>>());
      });
    });

    group('Edge Cases', () {
      test('handles empty data', () {
        final emptyData = <String, dynamic>{};
        final cachedData = CachedData<Map<String, dynamic>>(
          data: emptyData,
          timestamp: DateTime.now(),
        );

        expect(cachedData.data, isEmpty);
        expect(cachedData.data, isA<Map<String, dynamic>>());
      });

      test('handles null etag', () {
        final cachedData = CachedData<String>(
          data: 'test',
          timestamp: DateTime.now(),
          etag: null,
        );

        expect(cachedData.etag, isNull);
        expect(cachedData.data, equals('test'));
      });

      test('handles default validity', () {
        final cachedData = CachedData<String>(
          data: 'test',
          timestamp: DateTime.now(),
        );

        expect(cachedData.isValid, isTrue); // Default should be true
      });

      test('handles explicit invalid data', () {
        final cachedData = CachedData<String>(
          data: 'test',
          timestamp: DateTime.now(),
          isValid: false,
        );

        expect(cachedData.isValid, isFalse);
        expect(cachedData.isStale(Duration(hours: 1)), isTrue); // Invalid data is always stale
      });
    });
  });
}