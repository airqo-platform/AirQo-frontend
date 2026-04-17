import 'dart:convert';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';

part 'declared_places_state.dart';

class DeclaredPlacesCubit extends Cubit<DeclaredPlacesState> with UiLoggy {
  static const String _hiveKey = 'declared_places_v1';

  final UserPreferencesRepository _prefsRepo;

  DeclaredPlacesCubit({UserPreferencesRepository? prefsRepo})
      : _prefsRepo = prefsRepo ?? UserPreferencesImpl(),
        super(DeclaredPlacesInitial()) {
    _loadPlaces();
  }

  Future<Box> _getBox() async {
    if (Hive.isBoxOpen('preferencesBox')) return Hive.box('preferencesBox');
    return Hive.openBox('preferencesBox');
  }

  Future<void> _loadPlaces() async {
    // Try API first.
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId != null) {
      try {
        final response = await _prefsRepo.getUserPreferences(userId);
        if (response['success'] == true) {
          final data = response['data'] ?? (response['preferences'] is List
              ? (response['preferences'] as List).firstOrNull
              : null);
          if (data is Map<String, dynamic>) {
            final places = _parseDeclaredPlaces(data);
            await _cacheToHive(places);
            emit(DeclaredPlacesLoaded(places: places));
            return;
          }
        }
      } catch (e) {
        loggy.warning('Could not load declared places from API, falling back to cache: $e');
      }
    }

    // Fall back to Hive (offline).
    try {
      final box = await _getBox();
      final raw = box.get(_hiveKey);
      if (raw != null) {
        final jsonList = jsonDecode(raw as String) as List<dynamic>;
        final places = jsonList
            .map((j) => DeclaredPlace.fromJson(Map<String, dynamic>.from(j as Map)))
            .toList();
        emit(DeclaredPlacesLoaded(places: places));
        return;
      }
    } catch (e) {
      loggy.error('Error loading declared places from cache: $e');
    }

    emit(DeclaredPlacesLoaded(places: []));
  }

  List<DeclaredPlace> _parseDeclaredPlaces(Map<String, dynamic> data) {
    final raw = data['declared_places'];
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((j) => DeclaredPlace.fromJson(Map<String, dynamic>.from(j)))
        .toList();
  }

  Future<void> _cacheToHive(List<DeclaredPlace> places) async {
    try {
      final box = await _getBox();
      await box.put(_hiveKey, jsonEncode(places.map((p) => p.toJson()).toList()));
    } catch (e) {
      loggy.error('Error caching declared places: $e');
    }
  }

  Future<void> _persist(List<DeclaredPlace> places) async {
    await _cacheToHive(places);

    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId == null) return;

    try {
      // Fetch current prefs to preserve selected_sites (write-time only — acceptable).
      final current = await _prefsRepo.getUserPreferences(userId);
      List<dynamic> selectedSites = [];
      if (current['success'] == true) {
        final data = current['data'] ?? (current['preferences'] is List
            ? (current['preferences'] as List).firstOrNull
            : null);
        if (data is Map<String, dynamic>) {
          selectedSites = (data['selected_sites'] ?? data['selectedSites'] ?? []) as List;
        }
      }
      await _prefsRepo.replacePreference({
        'user_id': userId,
        'selected_sites': selectedSites,
        'declared_places': places.map((p) => p.toJson()).toList(),
      });
    } catch (e) {
      loggy.error('Error syncing declared places to API: $e');
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

  void reload() => _loadPlaces();

  DeclaredPlace? forSite(String siteId) {
    try {
      return _current.firstWhere((p) => p.siteId == siteId);
    } catch (_) {
      return null;
    }
  }
}
