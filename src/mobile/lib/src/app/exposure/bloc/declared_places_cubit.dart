import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/declared_places_repository.dart';
import 'package:airqo/src/app/exposure/repository/hourly_readings_repository.dart';

part 'declared_places_state.dart';

class DeclaredPlacesCubit extends Cubit<DeclaredPlacesState> with UiLoggy {
  final DeclaredPlacesRepository _placesRepo;
  final HourlyReadingsRepository _readingsRepo;

  DeclaredPlacesCubit({
    required DeclaredPlacesRepository placesRepo,
    required HourlyReadingsRepository readingsRepo,
  })  : _placesRepo = placesRepo,
        _readingsRepo = readingsRepo,
        super(DeclaredPlacesInitial()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final places = await _placesRepo.getDeclaredPlaces();
      if (isClosed) return;
      emit(DeclaredPlacesLoaded(places: places));
      _fetchReadings(places);
    } catch (e) {
      loggy.error('Failed to load declared places: $e');
      if (!isClosed) emit(const DeclaredPlacesLoaded(places: []));
    }
  }

  Future<void> _fetchReadings(List<DeclaredPlace> places) async {
    if (places.isEmpty) return;
    final today = DateTime.now();
    final results = await Future.wait(
      places.map((p) => _readingsRepo
          .fetchHourlyReadings(p.siteId, today)
          .then((r) => MapEntry(p.siteId, r))),
    );
    if (!isClosed && state is DeclaredPlacesLoaded) {
      emit((state as DeclaredPlacesLoaded).withReadings(Map.fromEntries(results)));
    }
  }

  List<DeclaredPlace> get _current =>
      state is DeclaredPlacesLoaded ? (state as DeclaredPlacesLoaded).places : [];

  void addPlace(DeclaredPlace place) {
    final updated = [..._current.where((p) => p.siteId != place.siteId), place];
    emit(DeclaredPlacesLoaded(places: updated));
    _placesRepo.saveDeclaredPlaces(updated);
  }

  void updatePlace(DeclaredPlace place) {
    final updated = _current.map((p) => p.siteId == place.siteId ? place : p).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _placesRepo.saveDeclaredPlaces(updated);
  }

  void removePlace(String siteId) {
    final updated = _current.where((p) => p.siteId != siteId).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _placesRepo.saveDeclaredPlaces(updated);
  }

  void reload() => _load();

  DeclaredPlace? forSite(String siteId) {
    try {
      return _current.firstWhere((p) => p.siteId == siteId);
    } catch (_) {
      return null;
    }
  }
}
