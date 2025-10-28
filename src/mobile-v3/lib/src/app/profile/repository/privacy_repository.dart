import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/profile/models/privacy_zone_model.dart';
import 'package:airqo/src/app/profile/models/location_data_model.dart';
import 'package:loggy/loggy.dart';

class PrivacyRepository extends BaseRepository with UiLoggy {
  static const String _privacyZonesBoxName = 'privacy_zones';
  static const String _locationDataBoxName = 'location_data';
  
  // Privacy Zones API endpoints
  static const String _privacyZonesEndpoint = '/api/v2/users/privacy/privacy-zones';
  
  // Location Data API endpoints  
  static const String _locationDataEndpoint = '/api/v2/users/privacy/location-data';
  static const String _locationDataRangeEndpoint = '/api/v2/users/privacy/location-data/range';

  // Privacy Zones Management
  Future<bool> createPrivacyZone(PrivacyZone zone) async {
    try {
      await _cachePrivacyZone(zone);

      try {
        final zoneData = zone.toCreateRequest();
        final apiResponse = await createPostRequest(
          path: _privacyZonesEndpoint,
          data: zoneData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully created privacy zone: ${zone.name}');
          return true;
        } else {
          throw Exception('API creation failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        loggy.warning('Failed to create zone on API, cached locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error creating privacy zone: $e');
      return false;
    }
  }

  Future<List<PrivacyZone>> getPrivacyZones() async {
    try {
      final cachedZones = await _getCachedPrivacyZones();
      
      try {
        final apiResponse = await createAuthenticatedGetRequest(
          _privacyZonesEndpoint,
          {},
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true && data['zones'] != null) {
          final zones = (data['zones'] as List)
              .map((zone) => PrivacyZone.fromJson(zone))
              .toList();
          
          await _cachePrivacyZones(zones);
          return zones;
        }
      } catch (e) {
        loggy.warning('Failed to fetch zones from API, using cached: $e');
      }

      return cachedZones;
    } catch (e) {
      loggy.error('Error getting privacy zones: $e');
      return [];
    }
  }

  Future<bool> updatePrivacyZone(String zoneId, PrivacyZone updatedZone) async {
    try {
      await _updateCachedPrivacyZone(zoneId, updatedZone);

      try {
        final zoneData = updatedZone.toCreateRequest();
        final apiResponse = await createAuthenticatedPutRequest(
          path: '$_privacyZonesEndpoint/$zoneId',
          data: zoneData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully updated privacy zone: $zoneId');
          return true;
        } else {
          throw Exception('API update failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        loggy.warning('Failed to update zone on API, cached locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error updating privacy zone: $e');
      return false;
    }
  }

  Future<bool> deletePrivacyZone(String zoneId) async {
    try {
      await _removeCachedPrivacyZone(zoneId);

      try {
        final apiResponse = await createDeleteRequest(
          path: '$_privacyZonesEndpoint/$zoneId',
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully deleted privacy zone: $zoneId');
          return true;
        } else {
          throw Exception('API deletion failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        loggy.warning('Failed to delete zone on API, removed locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error deleting privacy zone: $e');
      return false;
    }
  }

  // Location Data Management
  Future<LocationDataResponse> getLocationData({
    int? limit,
    int? skip,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (limit != null) queryParams['limit'] = limit.toString();
      if (skip != null) queryParams['skip'] = skip.toString();
      if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();

      final apiResponse = await createAuthenticatedGetRequest(
        _locationDataEndpoint,
        queryParams,
      );

      final data = json.decode(apiResponse.body);
      
      if (data['success'] == true) {
        return LocationDataResponse.fromJson(data);
      } else {
        throw Exception('API fetch failed: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error getting location data: $e');
      return const LocationDataResponse(data: [], total: 0, limit: 0, skip: 0);
    }
  }

  Future<bool> deleteLocationDataInRange(DateTime startDate, DateTime endDate) async {
    try {
      final requestData = DeleteLocationDataRangeRequest(
        startDate: startDate,
        endDate: endDate,
      );

      final apiResponse = await createDeleteRequest(
        path: _locationDataRangeEndpoint,
        data: requestData.toJson(),
      );

      final data = json.decode(apiResponse.body);
      
      if (data['success'] == true) {
        loggy.info('Successfully deleted location data range: $startDate to $endDate');
        await _clearCachedLocationData();
        return true;
      } else {
        throw Exception('API deletion failed: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error deleting location data range: $e');
      return false;
    }
  }

  // Cache Management for Privacy Zones
  Future<List<PrivacyZone>> _getCachedPrivacyZones() async {
    try {
      final cachedData = await HiveRepository.getData('zones', _privacyZonesBoxName);
      if (cachedData != null) {
        final zonesJson = json.decode(cachedData) as List;
        return zonesJson.map((zone) => PrivacyZone.fromJson(zone)).toList();
      }
      return [];
    } catch (e) {
      loggy.error('Error getting cached privacy zones: $e');
      return [];
    }
  }

  Future<void> _cachePrivacyZone(PrivacyZone zone) async {
    try {
      final zones = await _getCachedPrivacyZones();
      zones.add(zone);
      await _cachePrivacyZones(zones);
    } catch (e) {
      loggy.error('Error caching privacy zone: $e');
    }
  }

  Future<void> _cachePrivacyZones(List<PrivacyZone> zones) async {
    try {
      final zonesJson = zones.map((zone) => zone.toJson()).toList();
      await HiveRepository.saveData(_privacyZonesBoxName, 'zones', json.encode(zonesJson));
    } catch (e) {
      loggy.error('Error caching privacy zones: $e');
    }
  }

  Future<void> _updateCachedPrivacyZone(String zoneId, PrivacyZone updatedZone) async {
    try {
      final zones = await _getCachedPrivacyZones();
      final index = zones.indexWhere((zone) => zone.id == zoneId);
      if (index >= 0) {
        zones[index] = updatedZone;
        await _cachePrivacyZones(zones);
      }
    } catch (e) {
      loggy.error('Error updating cached privacy zone: $e');
    }
  }

  Future<void> _removeCachedPrivacyZone(String zoneId) async {
    try {
      final zones = await _getCachedPrivacyZones();
      zones.removeWhere((zone) => zone.id == zoneId);
      await _cachePrivacyZones(zones);
    } catch (e) {
      loggy.error('Error removing cached privacy zone: $e');
    }
  }

  Future<void> _clearCachedLocationData() async {
    try {
      await HiveRepository.deleteData(_locationDataBoxName, 'data');
      loggy.info('Cleared location data cache');
    } catch (e) {
      loggy.error('Error clearing location data cache: $e');
    }
  }

  Future<void> clearAllCache() async {
    try {
      await HiveRepository.deleteData(_privacyZonesBoxName, 'zones');
      await _clearCachedLocationData();
      loggy.info('Cleared all privacy cache');
    } catch (e) {
      loggy.error('Error clearing privacy cache: $e');
    }
  }

  Future<void> retryFailedSubmissions() async {
    try {
      final cachedZones = await _getCachedPrivacyZones();
      
      loggy.info('Retrying ${cachedZones.length} cached privacy zones');

      for (final zone in cachedZones) {
        try {
          final zoneData = zone.toCreateRequest();
          final apiResponse = await createPostRequest(
            path: _privacyZonesEndpoint,
            data: zoneData,
          );

          final data = json.decode(apiResponse.body);
          
          if (data['success'] == true) {
            loggy.info('Successfully synced privacy zone: ${zone.id}');
          }
        } catch (e) {
          loggy.warning('Failed to sync privacy zone ${zone.id}: $e');
        }
      }
    } catch (e) {
      loggy.error('Error in retryFailedSubmissions: $e');
    }
  }
}