import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/exposure_repository.dart';

part 'declared_places_state.dart';

class DeclaredPlacesCubit extends Cubit<DeclaredPlacesState> with UiLoggy {
  final ExposureRepository _repo;

  DeclaredPlacesCubit({required ExposureRepository repo})
      : _repo = repo,
        super(DeclaredPlacesInitial()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final places = await _repo.getDeclaredPlaces();
      emit(DeclaredPlacesLoaded(places: places));
    } catch (e) {
      loggy.error('Failed to load declared places: $e');
      emit(DeclaredPlacesLoaded(places: []));
    }
  }

  List<DeclaredPlace> get _current =>
      state is DeclaredPlacesLoaded ? (state as DeclaredPlacesLoaded).places : [];

  void addPlace(DeclaredPlace place) {
    final updated = [..._current.where((p) => p.siteId != place.siteId), place];
    emit(DeclaredPlacesLoaded(places: updated));
    _repo.saveDeclaredPlaces(updated);
  }

  void updatePlace(DeclaredPlace place) {
    final updated = _current.map((p) => p.siteId == place.siteId ? place : p).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _repo.saveDeclaredPlaces(updated);
  }

  void removePlace(String siteId) {
    final updated = _current.where((p) => p.siteId != siteId).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _repo.saveDeclaredPlaces(updated);
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
