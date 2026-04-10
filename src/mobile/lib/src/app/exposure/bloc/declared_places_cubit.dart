import 'dart:convert';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';

part 'declared_places_state.dart';

class DeclaredPlacesCubit extends Cubit<DeclaredPlacesState> with UiLoggy {
  static const String _hiveKey = 'declared_places_v1';

  DeclaredPlacesCubit() : super(DeclaredPlacesInitial()) {
    _loadPlaces();
  }

  Future<void> _loadPlaces() async {
    try {
      final box = Hive.box('preferencesBox');
      final raw = box.get(_hiveKey);
      if (raw != null) {
        final jsonList = jsonDecode(raw as String) as List<dynamic>;
        final places = jsonList
            .map((j) => DeclaredPlace.fromJson(Map<String, dynamic>.from(j as Map)))
            .toList();
        emit(DeclaredPlacesLoaded(places: places));
      } else {
        emit(DeclaredPlacesLoaded(places: []));
      }
    } catch (e) {
      loggy.error('Error loading declared places: $e');
      emit(DeclaredPlacesLoaded(places: []));
    }
  }

  Future<void> _persist(List<DeclaredPlace> places) async {
    try {
      final box = Hive.box('preferencesBox');
      await box.put(_hiveKey, jsonEncode(places.map((p) => p.toJson()).toList()));
    } catch (e) {
      loggy.error('Error saving declared places: $e');
    }
  }

  List<DeclaredPlace> get _current =>
      state is DeclaredPlacesLoaded ? (state as DeclaredPlacesLoaded).places : [];

  void addPlace(DeclaredPlace place) {
    final updated = [..._current.where((p) => p.siteId != place.siteId), place];
    emit(DeclaredPlacesLoaded(places: updated));
    _persist(updated);
  }

  void updatePlace(DeclaredPlace place) {
    final updated = _current.map((p) => p.siteId == place.siteId ? place : p).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _persist(updated);
  }

  void removePlace(String siteId) {
    final updated = _current.where((p) => p.siteId != siteId).toList();
    emit(DeclaredPlacesLoaded(places: updated));
    _persist(updated);
  }

  DeclaredPlace? forSite(String siteId) {
    try {
      return _current.firstWhere((p) => p.siteId == siteId);
    } catch (_) {
      return null;
    }
  }
}
