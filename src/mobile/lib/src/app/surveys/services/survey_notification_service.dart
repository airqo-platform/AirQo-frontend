import 'package:airqo/src/app/shared/repository/hive_repository.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:loggy/loggy.dart';

class SurveyNotificationService with UiLoggy {
  static const String _lastSeenSurveysKey = 'last_seen_surveys_timestamp';
  static const String _dismissedBannersKey = 'dismissed_survey_banners';
  static const String _boxName = 'survey_notifications';
  
  // Static flag to track if the session alert has been shown
  static bool hasShownSessionAlert = false;

  /// Get the timestamp when surveys were last seen
  Future<DateTime?> getLastSeenTimestamp() async {
    try {
      final timestampStr = await HiveRepository.getData(
        _lastSeenSurveysKey,
        _boxName,
      );
      if (timestampStr != null) {
        return DateTime.parse(timestampStr);
      }
      return null;
    } catch (e) {
      loggy.error('Error getting last seen timestamp: $e');
      return null;
    }
  }

  /// Update the timestamp when surveys were last seen
  Future<void> updateLastSeenTimestamp() async {
    try {
      await HiveRepository.saveData(
        _boxName,
        _lastSeenSurveysKey,
        DateTime.now().toIso8601String(),
      );
    } catch (e) {
      loggy.error('Error updating last seen timestamp: $e');
    }
  }

  /// Check if there are new surveys (active and not completed)
  Future<bool> hasNewSurveys(
    List<Survey> surveys,
    List<SurveyResponse> userResponses,
  ) async {
    try {
      final completedSurveyIds = userResponses
          .where((r) => r.isCompleted)
          .map((r) => r.surveyId)
          .toSet();

      return surveys.any((survey) {
        final isNotCompleted = !completedSurveyIds.contains(survey.id);
        return isNotCompleted && survey.isActive && !survey.isExpired;
      });
    } catch (e) {
      loggy.error('Error checking for new surveys: $e');
      return false;
    }
  }

  /// Get count of new/unseen surveys (active and not completed)
  Future<int> getNewSurveysCount(
    List<Survey> surveys,
    List<SurveyResponse> userResponses,
  ) async {
    try {
      final completedSurveyIds = userResponses
          .where((r) => r.isCompleted)
          .map((r) => r.surveyId)
          .toSet();

      return surveys.where((survey) {
        final isNotCompleted = !completedSurveyIds.contains(survey.id);
        return isNotCompleted && survey.isActive && !survey.isExpired;
      }).length;
    } catch (e) {
      loggy.error('Error getting new surveys count: $e');
      return 0;
    }
  }

  /// Check if a banner for a specific survey has been dismissed
  Future<bool> isBannerDismissed(String surveyId) async {
    try {
      final dismissedIdsStr = await HiveRepository.getData(
        _dismissedBannersKey,
        _boxName,
      );
      if (dismissedIdsStr == null) return false;

      final dismissedIds = dismissedIdsStr.split(',');
      return dismissedIds.contains(surveyId);
    } catch (e) {
      loggy.error('Error checking dismissed banner: $e');
      return false;
    }
  }

  /// Mark a banner as dismissed
  Future<void> dismissBanner(String surveyId) async {
    try {
      final dismissedIdsStr = await HiveRepository.getData(
        _dismissedBannersKey,
        _boxName,
      );
      
      final dismissedIds = dismissedIdsStr != null
          ? dismissedIdsStr.split(',').where((id) => id.isNotEmpty).toList()
          : <String>[];

      if (!dismissedIds.contains(surveyId)) {
        dismissedIds.add(surveyId);
        await HiveRepository.saveData(
          _boxName,
          _dismissedBannersKey,
          dismissedIds.join(','),
        );
      }
    } catch (e) {
      loggy.error('Error dismissing banner: $e');
    }
  }

  /// Get the most recent new survey (for banner display)
  Future<Survey?> getMostRecentNewSurvey(
    List<Survey> surveys,
    List<SurveyResponse> userResponses,
  ) async {
    try {
      final completedSurveyIds = userResponses
          .where((r) => r.isCompleted)
          .map((r) => r.surveyId)
          .toSet();

      final newSurveys = surveys.where((survey) {
        final isNotCompleted = !completedSurveyIds.contains(survey.id);
        return isNotCompleted && survey.isActive && !survey.isExpired;
      }).toList();

      if (newSurveys.isEmpty) return null;

      // Sort by creation date descending and return the most recent
      newSurveys.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return newSurveys.first;
    } catch (e) {
      loggy.error('Error getting most recent new survey: $e');
      return null;
    }
  }
}

