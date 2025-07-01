import 'dart:async';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:loggy/loggy.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_trigger_model.dart';

class SurveyTriggerService with UiLoggy {
  static final SurveyTriggerService _instance = SurveyTriggerService._internal();
  factory SurveyTriggerService() => _instance;
  SurveyTriggerService._internal();

  // Streams and controllers
  final StreamController<Survey> _surveyTriggeredController = StreamController<Survey>.broadcast();
  Stream<Survey> get surveyTriggeredStream => _surveyTriggeredController.stream;

  // Internal state
  List<Survey> _activeSurveys = [];
  List<SurveyTriggerHistory> _triggerHistory = [];
  Timer? _periodicCheckTimer;
  Position? _lastKnownPosition;
  Map<String, dynamic>? _lastAirQualityData;

  // Settings
  static const Duration _defaultCooldownPeriod = Duration(hours: 6);
  static const Duration _checkInterval = Duration(minutes: 5);

  // Getters
  List<Survey> get activeSurveys => List.unmodifiable(_activeSurveys);
  List<SurveyTriggerHistory> get triggerHistory => List.unmodifiable(_triggerHistory);

  /// Initialize the service
  Future<void> initialize() async {
    await _loadTriggerHistory();
    _startPeriodicChecks();
    loggy.info('SurveyTriggerService initialized');
  }

  /// Dispose of resources
  void dispose() {
    _periodicCheckTimer?.cancel();
    _surveyTriggeredController.close();
  }

  /// Set active surveys that can be triggered
  void setActiveSurveys(List<Survey> surveys) {
    _activeSurveys = surveys.where((survey) => survey.isValid).toList();
    loggy.info('Set ${_activeSurveys.length} active surveys');
  }

  /// Update current location (called by location service)
  void updateLocation(Position position) {
    _lastKnownPosition = position;
    _checkLocationBasedTriggers(position);
  }

  /// Update air quality data (called by air quality service)
  void updateAirQuality(Map<String, dynamic> airQualityData) {
    _lastAirQualityData = airQualityData;
    _checkAirQualityThresholdTriggers(airQualityData);
  }

  /// Manually trigger a survey
  Future<bool> triggerSurvey(String surveyId, {Map<String, dynamic>? contextData}) async {
    final survey = _activeSurveys.where((s) => s.id == surveyId).firstOrNull;
    if (survey == null) {
      loggy.warning('Survey not found: $surveyId');
      return false;
    }

    return await _triggerSurvey(survey, contextData: contextData);
  }

  /// Check if a survey can be triggered (respects cooldown)
  bool canTriggerSurvey(String surveyId, [Duration? cooldownPeriod]) {
    final history = _getTriggerHistoryForSurvey(surveyId);
    if (history == null) return true;

    final cooldown = cooldownPeriod ?? _defaultCooldownPeriod;
    return history.canTriggerAgain(cooldown);
  }

  /// Get trigger history for a specific survey
  SurveyTriggerHistory? _getTriggerHistoryForSurvey(String surveyId) {
    try {
      return _triggerHistory.firstWhere((h) => h.surveyId == surveyId);
    } catch (e) {
      return null;
    }
  }

  /// Start periodic checks for time-based triggers
  void _startPeriodicChecks() {
    _periodicCheckTimer = Timer.periodic(_checkInterval, (timer) {
      _checkTimeBasedTriggers();
    });
  }

  /// Check location-based triggers
  void _checkLocationBasedTriggers(Position currentPosition) {
    for (final survey in _activeSurveys) {
      if (survey.trigger.type != SurveyTriggerType.locationBased) continue;
      if (!canTriggerSurvey(survey.id)) continue;

      final conditions = survey.trigger.conditions;
      if (conditions == null) continue;

      try {
        final locationCondition = LocationBasedTriggerCondition.fromJson(conditions);
        if (locationCondition.isTriggered(currentPosition)) {
          final contextData = SurveyTriggerContext(
            currentLocation: currentPosition,
            currentAirQuality: _lastAirQualityData?['pm2_5']?.toDouble(),
            currentAirQualityCategory: _lastAirQualityData?['category'],
            timestamp: DateTime.now(),
          );

          _triggerSurvey(survey, contextData: contextData.toJson());
        }
      } catch (e) {
        loggy.error('Error checking location trigger for survey ${survey.id}: $e');
      }
    }
  }

  /// Check air quality threshold triggers
  void _checkAirQualityThresholdTriggers(Map<String, dynamic> airQualityData) {
    for (final survey in _activeSurveys) {
      if (survey.trigger.type != SurveyTriggerType.airQualityThreshold) continue;
      if (!canTriggerSurvey(survey.id)) continue;

      final conditions = survey.trigger.conditions;
      if (conditions == null) continue;

      try {
        final thresholdCondition = AirQualityThresholdTriggerCondition.fromJson(conditions);
        final currentValue = airQualityData[thresholdCondition.pollutant]?.toDouble();
        
        if (currentValue != null && thresholdCondition.isTriggered(currentValue)) {
          final contextData = SurveyTriggerContext(
            currentLocation: _lastKnownPosition,
            currentAirQuality: currentValue,
            currentAirQualityCategory: airQualityData['category'],
            timestamp: DateTime.now(),
            additionalData: {'pollutant': thresholdCondition.pollutant},
          );

          _triggerSurvey(survey, contextData: contextData.toJson());
        }
      } catch (e) {
        loggy.error('Error checking air quality trigger for survey ${survey.id}: $e');
      }
    }
  }

  /// Check time-based triggers
  void _checkTimeBasedTriggers() {
    final now = DateTime.now();

    for (final survey in _activeSurveys) {
      if (survey.trigger.type != SurveyTriggerType.timeBased) continue;
      if (!canTriggerSurvey(survey.id)) continue;

      final conditions = survey.trigger.conditions;
      if (conditions == null) continue;

      try {
        final timeCondition = TimeBasedTriggerCondition.fromJson(conditions);
        
        // Check specific time trigger
        if (timeCondition.specificTime != null) {
          final targetTime = timeCondition.specificTime!;
          final timeDiff = now.difference(targetTime).abs();
          
          if (timeDiff.inMinutes < 5) { // Within 5 minutes of target time
            _triggerSurvey(survey);
            continue;
          }
        }

        // Check interval-based trigger
        if (timeCondition.intervalDuration != null) {
          final history = _getTriggerHistoryForSurvey(survey.id);
          if (history != null) {
            final timeSinceLastTrigger = now.difference(history.lastTriggered);
            if (timeSinceLastTrigger >= timeCondition.intervalDuration!) {
              _triggerSurvey(survey);
              continue;
            }
          } else {
            // First time, trigger immediately
            _triggerSurvey(survey);
            continue;
          }
        }

        // Check day of week and hour triggers
        if (timeCondition.daysOfWeek != null || timeCondition.hourOfDay != null) {
          bool shouldTrigger = true;

          if (timeCondition.daysOfWeek != null) {
            final currentDayOfWeek = now.weekday; // 1 = Monday, 7 = Sunday
            shouldTrigger = shouldTrigger && timeCondition.daysOfWeek!.contains(currentDayOfWeek);
          }

          if (timeCondition.hourOfDay != null) {
            shouldTrigger = shouldTrigger && (now.hour == timeCondition.hourOfDay);
          }

          if (shouldTrigger) {
            _triggerSurvey(survey);
          }
        }
      } catch (e) {
        loggy.error('Error checking time trigger for survey ${survey.id}: $e');
      }
    }
  }

  /// Actually trigger a survey
  Future<bool> _triggerSurvey(Survey survey, {Map<String, dynamic>? contextData}) async {
    try {
      loggy.info('Triggering survey: ${survey.title} (${survey.id})');

      // Update trigger history
      await _updateTriggerHistory(survey, contextData);

      // Emit the survey to listeners
      _surveyTriggeredController.add(survey);

      return true;
    } catch (e) {
      loggy.error('Error triggering survey ${survey.id}: $e');
      return false;
    }
  }

  /// Update trigger history
  Future<void> _updateTriggerHistory(Survey survey, Map<String, dynamic>? contextData) async {
    final now = DateTime.now();
    final existingHistoryIndex = _triggerHistory.indexWhere((h) => h.surveyId == survey.id);

    SurveyTriggerContext? context;
    if (contextData != null) {
      try {
        context = SurveyTriggerContext.fromJson(contextData);
      } catch (e) {
        loggy.warning('Error parsing context data: $e');
      }
    }

    if (existingHistoryIndex >= 0) {
      // Update existing history
      final existing = _triggerHistory[existingHistoryIndex];
      _triggerHistory[existingHistoryIndex] = SurveyTriggerHistory(
        surveyId: survey.id,
        triggerType: survey.trigger.type.toString().split('.').last,
        lastTriggered: now,
        triggerCount: existing.triggerCount + 1,
        lastContext: context,
      );
    } else {
      // Create new history
      _triggerHistory.add(SurveyTriggerHistory(
        surveyId: survey.id,
        triggerType: survey.trigger.type.toString().split('.').last,
        lastTriggered: now,
        triggerCount: 1,
        lastContext: context,
      ));
    }

    await _saveTriggerHistory();
  }

  /// Load trigger history from storage
  Future<void> _loadTriggerHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyString = prefs.getString('survey_trigger_history');
      
      if (historyString != null) {
        final historyList = jsonDecode(historyString) as List;
        _triggerHistory = historyList
            .map((json) => SurveyTriggerHistory.fromJson(json))
            .toList();
        
        loggy.info('Loaded ${_triggerHistory.length} trigger history entries');
      }
    } catch (e) {
      loggy.error('Error loading trigger history: $e');
      _triggerHistory = [];
    }
  }

  /// Save trigger history to storage
  Future<void> _saveTriggerHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = _triggerHistory.map((h) => h.toJson()).toList();
      await prefs.setString('survey_trigger_history', jsonEncode(historyJson));
    } catch (e) {
      loggy.error('Error saving trigger history: $e');
    }
  }

  /// Clear all trigger history (useful for testing)
  Future<void> clearTriggerHistory() async {
    _triggerHistory.clear();
    await _saveTriggerHistory();
    loggy.info('Cleared all trigger history');
  }

  /// Get statistics about triggers
  Map<String, dynamic> getTriggerStatistics() {
    final totalTriggers = _triggerHistory.fold<int>(0, (sum, h) => sum + h.triggerCount);
    final uniqueSurveys = _triggerHistory.map((h) => h.surveyId).toSet().length;
    
    final triggersByType = <String, int>{};
    for (final history in _triggerHistory) {
      triggersByType[history.triggerType] = (triggersByType[history.triggerType] ?? 0) + history.triggerCount;
    }

    return {
      'totalTriggers': totalTriggers,
      'uniqueSurveys': uniqueSurveys,
      'triggersByType': triggersByType,
      'activeSurveys': _activeSurveys.length,
    };
  }
}