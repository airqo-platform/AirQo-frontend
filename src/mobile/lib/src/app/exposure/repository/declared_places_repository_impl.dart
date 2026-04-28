import 'dart:convert';

import 'package:hive/hive.dart';
import 'package:loggy/loggy.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/dashboard/repository/user_preferences_repository.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/repository/declared_places_repository.dart';

class DeclaredPlacesRepositoryImpl extends DeclaredPlacesRepository with NetworkLoggy {
  static const String _hiveBox = 'preferencesBox';
  static const String _hiveKey = 'declared_places_v1';

  final UserPreferencesRepository _prefsRepo;

  DeclaredPlacesRepositoryImpl({UserPreferencesRepository? prefsRepo})
      : _prefsRepo = prefsRepo ?? UserPreferencesImpl();

  @override
  Future<List<DeclaredPlace>> getDeclaredPlaces() async {
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId != null) {
      try {
        final response = await _prefsRepo.getUserPreferences(userId);
        if (response['success'] == true) {
          final data = _extractPrefsData(response);
          if (data != null) {
            final places = _parseDeclaredPlaces(data);
            await _cacheToHive(places);
            return places;
          }
        }
      } catch (e) {
        loggy.warning('Could not fetch declared places from API, using cache: $e');
      }
    }
    return _loadFromHive();
  }

  @override
  Future<void> saveDeclaredPlaces(List<DeclaredPlace> places) async {
    await _cacheToHive(places);

    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (userId == null) return;

    try {
      final selectedSites = await _fetchCurrentSelectedSites(userId);
      await _prefsRepo.replacePreference({
        'user_id': userId,
        'selected_sites': selectedSites,
        'declared_places': places.map((p) => p.toJson()).toList(),
      });
    } catch (e) {
      loggy.error('Could not sync declared places to API: $e');
    }
  }

  Map<String, dynamic>? _extractPrefsData(Map<String, dynamic> response) {
    final data = response['data'];
    if (data is Map<String, dynamic>) return data;
    final prefs = response['preferences'];
    if (prefs is List && prefs.isNotEmpty) {
      return prefs.first as Map<String, dynamic>;
    }
    return null;
  }

  List<DeclaredPlace> _parseDeclaredPlaces(Map<String, dynamic> data) {
    final raw = data['declared_places'];
    if (raw is! List) return [];
    return raw
        .whereType<Map>()
        .map((j) => DeclaredPlace.fromJson(Map<String, dynamic>.from(j)))
        .toList();
  }

  Future<List<dynamic>> _fetchCurrentSelectedSites(String userId) async {
    try {
      final response = await _prefsRepo.getUserPreferences(userId);
      if (response['success'] == true) {
        final data = _extractPrefsData(response);
        if (data != null) {
          return (data['selected_sites'] ?? data['selectedSites'] ?? []) as List;
        }
      }
    } catch (e) {
      loggy.warning('Could not fetch selected_sites for preserve: $e');
    }
    return [];
  }

  Future<Box> _getBox() async {
    if (Hive.isBoxOpen(_hiveBox)) return Hive.box(_hiveBox);
    return Hive.openBox(_hiveBox);
  }

  Future<void> _cacheToHive(List<DeclaredPlace> places) async {
    try {
      final box = await _getBox();
      await box.put(_hiveKey, jsonEncode(places.map((p) => p.toJson()).toList()));
    } catch (e) {
      loggy.error('Could not cache declared places to Hive: $e');
    }
  }

  Future<List<DeclaredPlace>> _loadFromHive() async {
    try {
      final box = await _getBox();
      final raw = box.get(_hiveKey);
      if (raw != null) {
        final jsonList = jsonDecode(raw as String) as List<dynamic>;
        return jsonList
            .map((j) => DeclaredPlace.fromJson(Map<String, dynamic>.from(j as Map)))
            .toList();
      }
    } catch (e) {
      loggy.error('Could not load declared places from Hive: $e');
    }
    return [];
  }
}
