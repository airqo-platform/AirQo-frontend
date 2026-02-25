import 'dart:convert';
import 'package:collection/collection.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/shared/utils/device_id_manager.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/example/example_survey_data.dart';
import 'package:loggy/loggy.dart';
import 'package:http/http.dart' as http;

class DuplicateSurveySubmissionException implements Exception {
  final String message;
  const DuplicateSurveySubmissionException(
      [this.message = 'You have already submitted a response to this survey from this device.']);
  @override
  String toString() => message;
}

class SurveyRepository extends BaseRepository with UiLoggy {
  static const String _surveysBoxName = 'surveys';
  static const String _surveyResponsesBoxName = 'survey_responses';
  static const String _surveyStatsBoxName = 'survey_stats';

  static const bool _useMockData = false;

  final Map<String, int> _retryCount = <String, int>{};
  static const int _baseDelayMs = 1000;
  static const String _surveysEndpoint = '/api/v2/users/surveys';
  static const String _surveyResponsesEndpoint =
      '/api/v2/users/surveys/responses';
  static const String _surveyStatsEndpoint = '/api/v2/users/surveys/stats';

  Future<List<Survey>> getSurveys({bool forceRefresh = false}) async {
    try {
      if (_useMockData) {
        return _getMockSurveys(forceRefresh: forceRefresh);
      }

      final queryParams = {
        'isActive': 'true',
        'limit': '100',
      };

      final response = await createGetRequest(_surveysEndpoint, queryParams);
      final data = json.decode(utf8.decode(response.bodyBytes));

      if (data['success'] == true && data['surveys'] != null) {
        final surveys = (data['surveys'] as List)
            .map((surveyJson) => Survey.fromJson(surveyJson))
            .where((survey) => survey.isActive && !survey.isExpired)
            .toList();

        loggy.info('Fetched ${surveys.length} active surveys from API');
        return surveys;
      } else {
        throw Exception(
            'Failed to fetch surveys: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      loggy.error('Error fetching surveys: $e');

      if (e.toString().contains('session has expired') ||
          e.toString().contains('Authentication token not found')) {
        loggy.warning(
            'Survey auth error, returning empty list instead of propagating');
        return [];
      } else if (e.toString().contains('No internet')) {
        throw Exception('No internet connection. Please check your network.');
      } else {
        throw Exception('Unable to load surveys. Please try again later.');
      }
    }
  }

  /// Get a specific survey by ID
  Future<Survey?> getSurvey(String surveyId) async {
    try {
      final cachedSurveys = await _getCachedSurveys();
      final cachedSurvey =
          cachedSurveys.firstWhereOrNull((s) => s.id == surveyId);
      if (cachedSurvey != null) {
        return cachedSurvey;
      }

      final response = await createAuthenticatedGetRequest(
          '$_surveysEndpoint/$surveyId', {});
      final data = json.decode(utf8.decode(response.bodyBytes));

      if (data['success'] == true &&
          data['surveys'] != null &&
          data['surveys'].isNotEmpty) {
        return Survey.fromJson(data['surveys'][0]);
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
      await _cacheSurveyResponse(response);

      final userId =
          await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
      final isAuthenticated = userId != null;

      final responseData = response.toJson();

      http.Response apiResponse;

      if (isAuthenticated) {
        apiResponse = await createPostRequest(
          path: _surveyResponsesEndpoint,
          data: responseData,
        );
      } else {
        responseData['userId'] = 'guest';
        final deviceId = await DeviceIdManager.getDeviceId();
        responseData['deviceId'] = deviceId;
        loggy.info('Guest submission with deviceId: $deviceId');

        try {
          apiResponse = await createUnauthenticatedPostRequest(
            path: _surveyResponsesEndpoint,
            data: responseData,
          );
        } catch (e) {
          if (e.toString().contains('status=409')) {
            loggy.warning('Duplicate survey submission detected for guest');
            throw const DuplicateSurveySubmissionException();
          }
          rethrow;
        }
      }

      final data = json.decode(utf8.decode(apiResponse.bodyBytes));

      if (data['success'] == true) {
        loggy.info('Successfully submitted survey response: ${response.id}');

        final updatedResponse = response.copyWith(
          status: SurveyResponseStatus.completed,
          completedAt: DateTime.now(),
        );
        await _cacheSurveyResponse(updatedResponse);

        return true;
      } else {
        throw Exception(
            'API submission failed: ${data['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      if (e is DuplicateSurveySubmissionException) rethrow;

      loggy.error('Error submitting survey response: $e');

      final failedResponse = response.copyWith(
        status: SurveyResponseStatus.inProgress,
      );
      await _cacheSurveyResponse(failedResponse);

      return false;
    }
  }

  Future<List<SurveyResponse>> getSurveyResponses({
    String? surveyId,
    int? limit,
    int? skip,
    String? status,
  }) async {
    try {
      // Get cached responses
      final cachedResponses = await _getCachedSurveyResponses();

      var responses = surveyId != null
          ? cachedResponses.where((r) => r.surveyId == surveyId).toList()
          : cachedResponses;

      try {
        final queryParams = <String, String>{};
        if (surveyId != null) {
          queryParams['surveyId'] = surveyId;
        }
        if (limit != null) {
          queryParams['limit'] = limit.toString();
        }
        if (skip != null) {
          queryParams['skip'] = skip.toString();
        }
        if (status != null) {
          queryParams['status'] = status;
        }

        final apiResponse = await createAuthenticatedGetRequest(
            _surveyResponsesEndpoint, queryParams);
        final data = json.decode(utf8.decode(apiResponse.bodyBytes));

        if (data['success'] == true && data['responses'] != null) {
          final apiResponses = (data['responses'] as List)
              .map((responseJson) => SurveyResponse.fromJson(responseJson))
              .toList();

          responses = _mergeResponses(cachedResponses, apiResponses);

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

  Future<SurveyStats?> getSurveyStats(String surveyId) async {
    try {
      final cachedStats = await _getCachedSurveyStats(surveyId);

      try {
        final response = await createAuthenticatedGetRequest(
            '$_surveyStatsEndpoint/$surveyId', {});
        final data = json.decode(utf8.decode(response.bodyBytes));

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

  Future<void> retryFailedSubmissions({int maxRetries = 3}) async {
    try {
      final responses = await _getCachedSurveyResponses();
      final pendingResponses = responses
          .where((r) => r.status == SurveyResponseStatus.inProgress)
          .toList();

      loggy.info(
          'Retrying ${pendingResponses.length} failed submissions (max retries: $maxRetries)');

      for (final response in pendingResponses) {
        final currentRetryCount = _retryCount[response.id] ?? 0;

        if (currentRetryCount >= maxRetries) {
          loggy.warning(
              'Response ${response.id} exceeded max retries ($currentRetryCount >= $maxRetries), skipping');
          continue;
        }

        try {
          if (currentRetryCount > 0) {
            final delayMs = _baseDelayMs * (1 << currentRetryCount);
            loggy.info(
                'Waiting ${delayMs}ms before retry attempt ${currentRetryCount + 1} for response ${response.id}');
            await Future.delayed(Duration(milliseconds: delayMs));
          }

          _retryCount[response.id] = currentRetryCount + 1;

          await submitSurveyResponse(response);

          _retryCount.remove(response.id);
          loggy.info(
              'Successfully submitted response ${response.id} after ${currentRetryCount + 1} attempt(s)');
        } catch (e) {
          final newRetryCount = _retryCount[response.id] ?? 0;
          loggy.error(
              'Failed to submit response ${response.id} (attempt $newRetryCount): $e');

          if (newRetryCount >= maxRetries) {
            loggy.error(
                'Response ${response.id} failed after $maxRetries attempts, marking as failed');
            _retryCount.remove(response.id);
          }

          continue;
        }
      }

      loggy.info(
          'Completed retry attempts. Remaining failed responses: ${_retryCount.length}');
    } catch (e) {
      loggy.error('Error in retryFailedSubmissions: $e');
    }
  }

  Future<void> clearCache() async {
    try {
      await HiveRepository.deleteData(_surveysBoxName, 'surveys');
      await HiveRepository.deleteData(_surveyResponsesBoxName, 'responses');

      final responses = await _getCachedSurveyResponses();
      for (final response in responses) {
        await HiveRepository.deleteData(_surveyStatsBoxName, response.surveyId);
      }
      loggy.info('Cleared all survey cache');
    } catch (e) {
      loggy.error('Error clearing cache: $e');
    }
  }

  Future<List<Survey>> _getMockSurveys({bool forceRefresh = false}) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      if (!forceRefresh) {
        final cachedSurveys = await _getCachedSurveys();
        if (cachedSurveys.isNotEmpty) {
          loggy.info('Returning ${cachedSurveys.length} cached mock surveys');
          return cachedSurveys;
        }
      }

      final surveys = ExampleSurveyData.getAllExampleSurveys();

      await _cacheSurveys(surveys);

      loggy.info('Returning ${surveys.length} mock surveys');
      return surveys;
    } catch (e) {
      loggy.error('Error getting mock surveys: $e');
      rethrow;
    }
  }

  Future<List<Survey>> _getCachedSurveys() async {
    try {
      final cachedData =
          await HiveRepository.getData('surveys', _surveysBoxName);
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
      await HiveRepository.saveData(
          _surveysBoxName, 'surveys', json.encode(surveysJson));
    } catch (e) {
      loggy.error('Error caching surveys: $e');
    }
  }

  Future<List<SurveyResponse>> _getCachedSurveyResponses() async {
    try {
      final cachedData =
          await HiveRepository.getData('responses', _surveyResponsesBoxName);
      if (cachedData != null) {
        final responsesJson = json.decode(cachedData) as List;
        return responsesJson
            .map((json) => SurveyResponse.fromJson(json))
            .toList();
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

      final existingIndex = responses.indexWhere((r) => r.id == response.id);
      if (existingIndex >= 0) {
        responses[existingIndex] = response;
      } else {
        responses.add(response);
      }

      final responsesJson = responses.map((r) => r.toJson()).toList();
      await HiveRepository.saveData(
          _surveyResponsesBoxName, 'responses', json.encode(responsesJson));
    } catch (e) {
      loggy.error('Error caching survey response: $e');
    }
  }

  Future<SurveyStats?> _getCachedSurveyStats(String surveyId) async {
    try {
      final cachedData =
          await HiveRepository.getData(surveyId, _surveyStatsBoxName);
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
      await HiveRepository.saveData(
          _surveyStatsBoxName, stats.surveyId, json.encode(stats.toJson()));
    } catch (e) {
      loggy.error('Error caching survey stats: $e');
    }
  }

  List<SurveyResponse> _mergeResponses(
      List<SurveyResponse> cached, List<SurveyResponse> api) {
    final merged = <String, SurveyResponse>{};

    for (final response in cached) {
      merged[response.id] = response;
    }

    for (final response in api) {
      merged[response.id] = response;
    }

    return merged.values.toList();
  }
}
