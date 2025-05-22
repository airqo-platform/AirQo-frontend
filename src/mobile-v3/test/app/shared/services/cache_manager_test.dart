import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_v3/app/shared/services/cache_manager.dart';

void main() {
  group('CacheManager', () {
    late CacheManager cache;

    setUp(() {
      cache = CacheManager();
    });

    test('get returns null and has() is false when key is missing', () {
      expect(cache.get<String>('missingKey'), isNull);
      expect(cache.has('missingKey'), isFalse);
    });

    test('set and get store and return an int value', () {
      cache.set<int>('age', 30);
      expect(cache.get<int>('age'), equals(30));
      expect(cache.has('age'), isTrue);
    });

    test('set overwrites existing value', () {
      cache.set<String>('color', 'blue');
      cache.set<String>('color', 'red');
      expect(cache.get<String>('color'), equals('red'));
    });

    test('remove deletes the key and get returns null thereafter', () {
      cache.set<bool>('flag', true);
      expect(cache.has('flag'), isTrue);
      cache.remove('flag');
      expect(cache.get<bool>('flag'), isNull);
      expect(cache.has('flag'), isFalse);
    });

    test('clear removes all stored keys', () {
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.has('a'), isTrue);
      expect(cache.has('b'), isTrue);
      cache.clear();
      expect(cache.has('a'), isFalse);
      expect(cache.has('b'), isFalse);
    });

    test('supports different data types and null values', () {
      cache.set<List<int>>('nums', [1, 2, 3]);
      expect(cache.get<List<int>>('nums'), equals([1, 2, 3]));

      cache.set<String?>('nullable', null);
      expect(cache.get<String?>('nullable'), isNull);
      expect(cache.has('nullable'), isTrue);
    });

    test('get with wrong generic type throws TypeError', () {
      cache.set<String>('greeting', 'hello');
      expect(() => cache.get<int>('greeting'), throwsA(isA<TypeError>()));
    });
  });
}