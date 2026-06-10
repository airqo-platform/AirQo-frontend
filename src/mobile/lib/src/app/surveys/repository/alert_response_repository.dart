import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/surveys/models/alert_response_model.dart';
import 'package:loggy/loggy.dart';

class AlertResponseRepository extends BaseRepository with UiLoggy {
  static const String _alertResponsesBoxName = 'alert_responses';
  static const String _alertResponsesEndpoint = '/api/v2/users/behavioral/alert-responses';

  Future<bool> saveAlertResponse(AlertResponse response) async {
    try {
      await _cacheAlertResponse(response);

      try {
        final responseData = _formatResponseForAPI(response);
        final apiResponse = await createPostRequest(
          path: _alertResponsesEndpoint,
          data: responseData,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true) {
          loggy.info('Successfully submitted alert response: ${response.id}');
          return true;
        } else {
          throw Exception('API submission failed: ${data['message'] ?? 'Unknown error'}');
        }
      } catch (e) {
        loggy.warning('Failed to submit to API, cached locally: $e');
        return false;
      }
    } catch (e) {
      loggy.error('Error saving alert response: $e');
      return false;
    }
  }

  Future<List<AlertResponse>> getAlertResponses({String? alertId, int? limit, int? skip}) async {
    try {
      final cachedResponses = await _getCachedAlertResponses();
      
      try {
        final queryParams = <String, String>{};
        if (limit != null) queryParams['limit'] = limit.toString();
        if (skip != null) queryParams['skip'] = skip.toString();

        final apiResponse = await createAuthenticatedGetRequest(
          _alertResponsesEndpoint,
          queryParams,
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true && data['responses'] != null) {
          final responses = (data['responses'] as List)
              .map((response) => AlertResponse.fromJson(response))
              .toList();
          
          await _cacheAlertResponses(responses);
          
          if (alertId != null) {
            return responses.where((r) => r.alertId == alertId).toList();
          }
          
          return responses;
        }
      } catch (e) {
        loggy.warning('Failed to fetch responses from API, using cached: $e');
      }

      if (alertId != null) {
        return cachedResponses.where((r) => r.alertId == alertId).toList();
      }
      
      return cachedResponses;
    } catch (e) {
      loggy.error('Error getting alert responses: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> getResponseStats() async {
    try {
      try {
        final apiResponse = await createAuthenticatedGetRequest(
          '$_alertResponsesEndpoint/stats',
          {},
        );

        final data = json.decode(apiResponse.body);
        
        if (data['success'] == true && data['stats'] != null) {
          return data['stats'];
        }
      } catch (e) {
        loggy.warning('Failed to fetch stats from API, calculating from cached: $e');
      }

      final responses = await getAlertResponses();
      
      final totalResponses = responses.length;
      final followedCount = responses.where((r) => r.responseType == AlertResponseType.followed).length;
      final notFollowedCount = responses.where((r) => r.responseType == AlertResponseType.notFollowed).length;
      
      final followedReasons = <String, int>{};
      final notFollowedReasons = <String, int>{};
      
      for (final response in responses) {
        if (response.responseType == AlertResponseType.followed && response.followedReason != null) {
          final reason = response.followedReason!.displayText;
          followedReasons[reason] = (followedReasons[reason] ?? 0) + 1;
        } else if (response.responseType == AlertResponseType.notFollowed && response.notFollowedReason != null) {
          final reason = response.notFollowedReason!.displayText;
          notFollowedReasons[reason] = (notFollowedReasons[reason] ?? 0) + 1;
        }
      }

      return {
        'totalResponses': totalResponses,
        'followedCount': followedCount,
        'notFollowedCount': notFollowedCount,
        'followedPercentage': totalResponses > 0 ? (followedCount / totalResponses * 100) : 0.0,
        'followedReasons': followedReasons,
        'notFollowedReasons': notFollowedReasons,
        'lastResponseDate': responses.isNotEmpty 
            ? responses.map((r) => r.respondedAt).reduce((a, b) => a.isAfter(b) ? a : b)
            : null,
      };
    } catch (e) {
      loggy.error('Error getting response stats: $e');
      return {};
    }
  }

  Future<void> retryFailedSubmissions({int maxRetries = 3}) async {
    try {
      final cachedResponses = await _getCachedAlertResponses();
      
      loggy.info('Retrying ${cachedResponses.length} cached alert responses');

      for (final response in cachedResponses) {
        try {
          final responseData = response.toJson();
          final apiResponse = await createPostRequest(
            path: _alertResponsesEndpoint,
            data: responseData,
          );

          final data = json.decode(apiResponse.body);
          
          if (data['success'] == true) {
            await _removeFromCache(response.id);
            loggy.info('Successfully synced alert response: ${response.id}');
          }
        } catch (e) {
          loggy.warning('Failed to sync alert response ${response.id}: $e');
        }
      }
    } catch (e) {
      loggy.error('Error in retryFailedSubmissions: $e');
    }
  }

  Future<void> clearCache() async {
    try {
      await HiveRepository.deleteData(_alertResponsesBoxName, 'responses');
      loggy.info('Cleared alert responses cache');
    } catch (e) {
      loggy.error('Error clearing cache: $e');
    }
  }

  Future<List<AlertResponse>> _getCachedAlertResponses() async {
    try {
      final cachedData = await HiveRepository.getData('responses', _alertResponsesBoxName);
      if (cachedData != null) {
        final responsesJson = json.decode(cachedData) as List;
        return responsesJson.map((json) => AlertResponse.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      loggy.error('Error getting cached alert responses: $e');
      return [];
    }
  }

  Future<void> _cacheAlertResponse(AlertResponse response) async {
    try {
      final responses = await _getCachedAlertResponses();
      
      final existingIndex = responses.indexWhere((r) => r.id == response.id);
      if (existingIndex >= 0) {
        responses[existingIndex] = response;
      } else {
        responses.add(response);
      }

      final responsesJson = responses.map((r) => r.toJson()).toList();
      await HiveRepository.saveData(_alertResponsesBoxName, 'responses', json.encode(responsesJson));
    } catch (e) {
      loggy.error('Error caching alert response: $e');
    }
  }

  Future<void> _cacheAlertResponses(List<AlertResponse> responses) async {
    try {
      final responsesJson = responses.map((r) => r.toJson()).toList();
      await HiveRepository.saveData(_alertResponsesBoxName, 'responses', json.encode(responsesJson));
    } catch (e) {
      loggy.error('Error caching alert responses: $e');
    }
  }

  Future<void> _removeFromCache(String responseId) async {
    try {
      final responses = await _getCachedAlertResponses();
      responses.removeWhere((r) => r.id == responseId);
      
      final responsesJson = responses.map((r) => r.toJson()).toList();
      await HiveRepository.saveData(_alertResponsesBoxName, 'responses', json.encode(responsesJson));
    } catch (e) {
      loggy.error('Error removing alert response from cache: $e');
    }
  }

  Map<String, dynamic> _formatResponseForAPI(AlertResponse response) {
    String? followedReasonForAPI;
    
    if (response.responseType == AlertResponseType.followed && response.followedReason != null) {
      followedReasonForAPI = response.followedReason!.toString().split('.').last;
    }

    return {
      'alertId': response.alertId,
      'responseType': response.responseType.toString().split('.').last,
      if (followedReasonForAPI != null) 'followedReason': followedReasonForAPI,
      'respondedAt': response.respondedAt.toIso8601String(),
    };
  }
}