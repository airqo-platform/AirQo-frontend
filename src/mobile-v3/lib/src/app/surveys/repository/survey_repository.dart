import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:loggy/loggy.dart';
import 'package:http/http.dart' as http;

class SurveyRepository extends BaseRepository with UiLoggy {
  static const String _surveysBoxName = 'surveys';
  static const String _surveyResponsesBoxName = 'survey_responses';
  static const String _surveyStatsBoxName = 'survey_stats';

  // API endpoints
  static const String _surveysEndpoint = '/api/v2/surveys';
  static const String _surveyResponsesEndpoint = '/api/v2/survey-responses';
  static const String _surveyStatsEndpoint = '/api/v2/survey-stats';

  /// Get all available surveys
  Future<List<Survey>> getSurveys({bool forceRefresh = false}) async {
    try {
      // Try to get from cache first
      if (!forceRefresh) {
        final cachedSurveys = await _getCachedSurveys();
        if (cachedSurveys.isNotEmpty) {
          loggy.info('Returning ${cachedSurveys.length} cached surveys');
          return cachedSurveys;
        }
      }

      // Fetch from API
      final response = await createAuthenticatedGetRequest(path: _surveysEndpoint);
      final data = json.decode(response.body);

      if (data['success'] == true && data['surveys'] != null) {
        final surveys = (data['surveys'] as List)
            .map((surveyJson) => Survey.fromJson(surveyJson))
            .toList();

        // Cache the surveys
        await _cacheSurveys(surveys);
        
        loggy.info('Fetched ${surveys.length} surveys from API');
        return surveys;
      } else {
        throw Exception('Failed to fetch surveys: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error fetching surveys: $e');
      
      // Return cached data as fallback
      final cachedSurveys = await _getCachedSurveys();
      if (cachedSurveys.isNotEmpty) {
        loggy.info('Returning ${cachedSurveys.length} cached surveys as fallback');
        return cachedSurveys;
      }
      
      rethrow;
    }
  }

  /// Get a specific survey by ID
  Future<Survey?> getSurvey(String surveyId) async {
    try {
      // Check cache first
      final cachedSurveys = await _getCachedSurveys();
      final cachedSurvey = cachedSurveys.where((s) => s.id == surveyId).firstOrNull;
      if (cachedSurvey != null) {
        return cachedSurvey;
      }

      // Fetch from API
      final response = await createAuthenticatedGetRequest(path: '$_surveysEndpoint/$surveyId');
      final data = json.decode(response.body);

      if (data['success'] == true && data['survey'] != null) {
        return Survey.fromJson(data['survey']);
      }
      
      return null;
    } catch (e) {
      loggy.error('Error fetching survey $surveyId: $e');
      return null;
    }
  }

  /// Submit a survey response
  Future<bool> submitSurveyResponse(SurveyResponse response) async {
    try {
      // Save locally first
      await _cacheSurveyResponse(response);

      // Submit to API
      final responseData = response.toJson();
      final apiResponse = await createAuthenticatedPostRequest(
        path: _surveyResponsesEndpoint,
        data: responseData,
      );

      final data = json.decode(apiResponse.body);
      
      if (data['success'] == true) {
        loggy.info('Successfully submitted survey response: ${response.id}');
        
        // Mark as synced in local storage
        final updatedResponse = response.copyWith(
          status: SurveyResponseStatus.completed,
          completedAt: DateTime.now(),
        );
        await _cacheSurveyResponse(updatedResponse);
        
        return true;
      } else {
        throw Exception('API submission failed: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error submitting survey response: $e');
      
      // Keep locally cached for retry later
      final failedResponse = response.copyWith(
        status: SurveyResponseStatus.inProgress, // Mark as pending sync
      );
      await _cacheSurveyResponse(failedResponse);
      
      return false;
    }
  }

  /// Get user's survey responses
  Future<List<SurveyResponse>> getSurveyResponses({String? surveyId}) async {
    try {
      // Get cached responses
      final cachedResponses = await _getCachedSurveyResponses();
      
      // Filter by survey ID if provided
      var responses = surveyId != null 
          ? cachedResponses.where((r) => r.surveyId == surveyId).toList()
          : cachedResponses;

      // Try to sync with API
      try {
        final endpoint = surveyId != null 
            ? '$_surveyResponsesEndpoint?surveyId=$surveyId'
            : _surveyResponsesEndpoint;
            
        final apiResponse = await createAuthenticatedGetRequest(path: endpoint);
        final data = json.decode(apiResponse.body);

        if (data['success'] == true && data['responses'] != null) {
          final apiResponses = (data['responses'] as List)
              .map((responseJson) => SurveyResponse.fromJson(responseJson))
              .toList();

          // Merge with cached responses (API takes precedence)
          responses = _mergeResponses(cachedResponses, apiResponses);
          
          // Update cache
          for (final response in apiResponses) {
            await _cacheSurveyResponse(response);
          }
        }
      } catch (e) {
        loggy.warning('Could not sync with API, using cached responses: $e');
      }

      return responses;
    } catch (e) {
      loggy.error('Error getting survey responses: $e');
      return [];
    }
  }

  /// Get survey statistics
  Future<SurveyStats?> getSurveyStats(String surveyId) async {
    try {
      // Check cache first
      final cachedStats = await _getCachedSurveyStats(surveyId);
      
      // Try to get fresh data from API
      try {
        final response = await createAuthenticatedGetRequest(
          path: '$_surveyStatsEndpoint/$surveyId'
        );
        final data = json.decode(response.body);

        if (data['success'] == true && data['stats'] != null) {
          final stats = SurveyStats.fromJson(data['stats']);
          await _cacheSurveyStats(stats);
          return stats;
        }
      } catch (e) {
        loggy.warning('Could not fetch fresh stats, using cached: $e');
      }

      return cachedStats;
    } catch (e) {
      loggy.error('Error getting survey stats: $e');
      return null;
    }
  }

  /// Retry failed survey response submissions
  Future<void> retryFailedSubmissions() async {
    try {
      final responses = await _getCachedSurveyResponses();
      final pendingResponses = responses.where(
        (r) => r.status == SurveyResponseStatus.inProgress
      ).toList();

      loggy.info('Retrying ${pendingResponses.length} failed submissions');

      for (final response in pendingResponses) {
        await submitSurveyResponse(response);
      }
    } catch (e) {
      loggy.error('Error retrying failed submissions: $e');
    }
  }

  /// Clear all cached data
  Future<void> clearCache() async {
    try {
      await HiveRepository.clearBox(_surveysBoxName);
      await HiveRepository.clearBox(_surveyResponsesBoxName);
      await HiveRepository.clearBox(_surveyStatsBoxName);
      loggy.info('Cleared all survey cache');
    } catch (e) {
      loggy.error('Error clearing cache: $e');
    }
  }

  // Private helper methods

  Future<List<Survey>> _getCachedSurveys() async {
    try {
      final cachedData = await HiveRepository.getData('surveys', _surveysBoxName);
      if (cachedData != null) {
        final surveysJson = json.decode(cachedData) as List;
        return surveysJson.map((json) => Survey.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      loggy.error('Error getting cached surveys: $e');
      return [];
    }
  }

  Future<void> _cacheSurveys(List<Survey> surveys) async {
    try {
      final surveysJson = surveys.map((s) => s.toJson()).toList();
      await HiveRepository.setData('surveys', json.encode(surveysJson), _surveysBoxName);
    } catch (e) {
      loggy.error('Error caching surveys: $e');
    }
  }

  Future<List<SurveyResponse>> _getCachedSurveyResponses() async {
    try {
      final cachedData = await HiveRepository.getData('responses', _surveyResponsesBoxName);
      if (cachedData != null) {
        final responsesJson = json.decode(cachedData) as List;
        return responsesJson.map((json) => SurveyResponse.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      loggy.error('Error getting cached survey responses: $e');
      return [];
    }
  }

  Future<void> _cacheSurveyResponse(SurveyResponse response) async {
    try {
      final responses = await _getCachedSurveyResponses();
      
      // Update existing response or add new one
      final existingIndex = responses.indexWhere((r) => r.id == response.id);
      if (existingIndex >= 0) {
        responses[existingIndex] = response;
      } else {
        responses.add(response);
      }

      final responsesJson = responses.map((r) => r.toJson()).toList();
      await HiveRepository.setData('responses', json.encode(responsesJson), _surveyResponsesBoxName);
    } catch (e) {
      loggy.error('Error caching survey response: $e');
    }
  }

  Future<SurveyStats?> _getCachedSurveyStats(String surveyId) async {
    try {
      final cachedData = await HiveRepository.getData(surveyId, _surveyStatsBoxName);
      if (cachedData != null) {
        return SurveyStats.fromJson(json.decode(cachedData));
      }
      return null;
    } catch (e) {
      loggy.error('Error getting cached survey stats: $e');
      return null;
    }
  }

  Future<void> _cacheSurveyStats(SurveyStats stats) async {
    try {
      await HiveRepository.setData(
        stats.surveyId, 
        json.encode(stats.toJson()), 
        _surveyStatsBoxName
      );
    } catch (e) {
      loggy.error('Error caching survey stats: $e');
    }
  }

  List<SurveyResponse> _mergeResponses(
    List<SurveyResponse> cached, 
    List<SurveyResponse> api
  ) {
    final merged = <String, SurveyResponse>{};
    
    // Add cached responses
    for (final response in cached) {
      merged[response.id] = response;
    }
    
    // Override with API responses (more authoritative)
    for (final response in api) {
      merged[response.id] = response;
    }
    
    return merged.values.toList();
  }
}