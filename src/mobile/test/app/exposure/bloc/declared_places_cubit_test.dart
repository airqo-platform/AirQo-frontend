import 'dart:async';

import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/declared_places_repository.dart';
import 'package:airqo/src/app/exposure/repository/hourly_readings_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('adding a Favorite preserves existing readings and loads the new site',
      () async {
    final placesRepository = _FakePlacesRepository([_place('site-1')]);
    final cubit = DeclaredPlacesCubit(
      placesRepo: placesRepository,
      readingsRepo: _FakeHourlyReadingsRepository(),
    );
    await pumpEventQueue();

    final initial = cubit.state as DeclaredPlacesLoaded;
    expect(initial.readings['site-1']?.single.pm25, 11);

    cubit.addPlace(_place('site-2'));
    final whileLoading = cubit.state as DeclaredPlacesLoaded;
    expect(whileLoading.readings['site-1']?.single.pm25, 11);

    await pumpEventQueue();
    final updated = cubit.state as DeclaredPlacesLoaded;
    expect(updated.places.map((place) => place.siteId),
        containsAll(['site-1', 'site-2']));
    expect(updated.readings['site-1']?.single.pm25, 11);
    expect(updated.readings['site-2']?.single.pm25, 22);
    await cubit.close();
  });

  test('a stale batch does not wipe a Favorite added while it was in flight',
      () async {
    final placesRepository = _FakePlacesRepository([_place('site-1')]);
    final readingsRepo = _GatedBatchReadingsRepository();
    final cubit = DeclaredPlacesCubit(
      placesRepo: placesRepository,
      readingsRepo: readingsRepo,
    );
    await pumpEventQueue();

    cubit.addPlace(_place('site-2'));
    await pumpEventQueue();
    readingsRepo.releaseInitialBatch();
    await pumpEventQueue();

    final loaded = cubit.state as DeclaredPlacesLoaded;
    expect(loaded.places.map((place) => place.siteId),
        containsAll(['site-1', 'site-2']));
    expect(loaded.readings['site-2']?.single.pm25, 22);
    await cubit.close();
  });
}

DeclaredPlace _place(String siteId) => DeclaredPlace(
      siteId: siteId,
      displayName: siteId,
      locationName: siteId,
      city: 'Kampala',
      type: PlaceType.other,
    );

class _FakePlacesRepository implements DeclaredPlacesRepository {
  _FakePlacesRepository(this.places);

  List<DeclaredPlace> places;

  @override
  Future<List<DeclaredPlace>> getDeclaredPlaces(
          {bool forceRefresh = false}) async =>
      places;

  @override
  Future<void> saveDeclaredPlaces(List<DeclaredPlace> places) async {
    this.places = places;
  }
}

class _FakeHourlyReadingsRepository extends HourlyReadingsRepository {
  @override
  Future<List<HourlyReading>> fetchHourlyReadings(
    String siteId,
    DateTime date,
  ) async {
    return [
      HourlyReading(hour: 17, pm25: siteId == 'site-1' ? 11 : 22),
    ];
  }
}

class _GatedBatchReadingsRepository extends HourlyReadingsRepository {
  final Completer<void> _initialBatch = Completer<void>();
  var _batchCalls = 0;

  void releaseInitialBatch() {
    if (!_initialBatch.isCompleted) {
      _initialBatch.complete();
    }
  }

  @override
  Future<List<HourlyReading>> fetchHourlyReadings(
    String siteId,
    DateTime date,
  ) async {
    return [
      HourlyReading(hour: 17, pm25: siteId == 'site-1' ? 11 : 22),
    ];
  }

  @override
  Future<Map<String, List<HourlyReading>>> fetchHourlyReadingsForPlaces(
    List<DeclaredPlace> places,
    DateTime date,
  ) async {
    _batchCalls += 1;
    if (_batchCalls == 1) {
      await _initialBatch.future;
    }
    return {
      for (final place in places)
        place.siteId: [
          HourlyReading(hour: 17, pm25: place.siteId == 'site-1' ? 11 : 22),
        ],
    };
  }
}
