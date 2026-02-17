import 'package:airqo/src/app/surveys/models/survey_model.dart';

/// Example survey data for testing the survey system
class ExampleSurveyData {
  static Survey createPostExposureSurvey() {
    return Survey(
      id: 'post_exposure_001',
      title: 'Air Quality Exposure Assessment',
      description: 'Help us understand how air quality affects your daily activities and health.',
      questions: [
        SurveyQuestion(
          id: 'activity_type',
          question: 'What activity were you doing when you received this survey?',
          type: QuestionType.multipleChoice,
          options: [
            'Walking/Commuting outdoors',
            'Exercising outdoors',
            'Working outdoors',
            'Relaxing outdoors',
            'Indoor activities',
            'Other',
          ],
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'exposure_awareness',
          question: 'Were you aware of the air quality levels before starting this activity?',
          type: QuestionType.yesNo,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'health_symptoms',
          question: 'Did you experience any of the following symptoms during or after your activity?',
          type: QuestionType.multipleChoice,
          options: [
            'No symptoms',
            'Coughing',
            'Difficulty breathing',
            'Eye irritation',
            'Headache',
            'Fatigue',
            'Other symptoms',
          ],
          isRequired: false,
        ),
        SurveyQuestion(
          id: 'activity_modification',
          question: 'How likely are you to modify your outdoor activities based on air quality information?',
          type: QuestionType.rating,
          maxValue: 5,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'additional_comments',
          question: 'Do you have any additional comments about air quality and your daily activities?',
          type: QuestionType.text,
          placeholder: 'Optional: Share any thoughts or experiences...',
          isRequired: false,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.postExposure,
        conditions: {
          'threshold': 50.0, // PM2.5 threshold
          'duration': 1800, // 30 minutes in seconds
        },
      ),
      timeToComplete: const Duration(minutes: 3),
      isActive: true,
      createdAt: DateTime.now(),
    );
  }

  static Survey createLocationBasedSurvey() {
    return Survey(
      id: 'location_001',
      title: 'School Zone Air Quality Survey',
      description: 'Quick survey about air quality around schools and children\'s health.',
      questions: [
        SurveyQuestion(
          id: 'school_relation',
          question: 'What is your relationship to this school?',
          type: QuestionType.multipleChoice,
          options: [
            'Parent/Guardian',
            'Teacher/Staff',
            'Student',
            'Community member',
            'Just passing by',
          ],
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'concern_level',
          question: 'How concerned are you about air quality around schools?',
          type: QuestionType.scale,
          minValue: 1,
          maxValue: 10,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'protective_measures',
          question: 'What measures do you think schools should take to protect children from air pollution?',
          type: QuestionType.text,
          placeholder: 'Share your suggestions...',
          isRequired: false,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.locationBased,
        conditions: {
          'latitude': -0.3476,  // Example school location
          'longitude': 32.5825,
          'radius': 500.0, // 500 meters
          'triggerOnEnter': true,
          'locationName': 'School Zone',
        },
      ),
      timeToComplete: const Duration(minutes: 2),
      isActive: true,
      createdAt: DateTime.now(),
    );
  }

  static Survey createDailySurvey() {
    return Survey(
      id: 'daily_001',
      title: 'Daily Air Quality Experience',
      description: 'Tell us about your daily experience with air quality.',
      questions: [
        SurveyQuestion(
          id: 'air_quality_rating',
          question: 'How would you rate today\'s air quality in your area?',
          type: QuestionType.rating,
          maxValue: 5,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'outdoor_time',
          question: 'How much time did you spend outdoors today?',
          type: QuestionType.multipleChoice,
          options: [
            'Less than 30 minutes',
            '30 minutes - 1 hour',
            '1-3 hours',
            '3-6 hours',
            'More than 6 hours',
          ],
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'behavior_change',
          question: 'Did you modify any activities today due to air quality?',
          type: QuestionType.yesNo,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'modification_details',
          question: 'If yes, what modifications did you make?',
          type: QuestionType.text,
          placeholder: 'Describe any changes you made...',
          isRequired: false,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.timeBased,
        conditions: {
          'hourOfDay': 18, // 6 PM
          'repeat': true,
          'daysOfWeek': [1, 2, 3, 4, 5], // Monday to Friday
        },
      ),
      timeToComplete: const Duration(minutes: 2),
      isActive: true,
      createdAt: DateTime.now(),
    );
  }

  static Survey createThresholdSurvey() {
    return Survey(
      id: 'threshold_001',
      title: 'High Pollution Alert Response',
      description: 'Quick survey when air quality reaches unhealthy levels.',
      questions: [
        SurveyQuestion(
          id: 'alert_awareness',
          question: 'Did you receive an air quality alert before this survey?',
          type: QuestionType.yesNo,
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'planned_response',
          question: 'How do you plan to respond to the current air quality conditions?',
          type: QuestionType.multipleChoice,
          options: [
            'Stay indoors',
            'Limit outdoor activities',
            'Wear a mask outdoors',
            'Use air purifier indoors',
            'Continue normal activities',
            'Leave the area if possible',
          ],
          isRequired: true,
        ),
        SurveyQuestion(
          id: 'health_priority',
          question: 'Rate how much you prioritize health protection over daily activities',
          type: QuestionType.scale,
          minValue: 1,
          maxValue: 10,
          isRequired: true,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.airQualityThreshold,
        conditions: {
          'threshold': 75.0,
          'comparison': 'greater',
          'pollutant': 'pm2_5',
          'sustainedDuration': 1800, // 30 minutes
        },
      ),
      timeToComplete: const Duration(minutes: 1),
      isActive: true,
      createdAt: DateTime.now(),
    );
  }

  /// Get all example surveys
  static List<Survey> getAllExampleSurveys() {
    return [
      createPostExposureSurvey(),
      createLocationBasedSurvey(),
      createDailySurvey(),
      createThresholdSurvey(),
    ];
  }

  /// Create sample context data for testing
  static Map<String, dynamic> createSampleContextData() {
    return {
      'currentLocation': {
        'latitude': -0.3476,
        'longitude': 32.5825,
        'timestamp': DateTime.now().toIso8601String(),
        'accuracy': 10.0,
        'altitude': 1200.0,
        'altitudeAccuracy': 5.0,
        'heading': 0.0,
        'headingAccuracy': 0.0,
        'speed': 0.0,
        'speedAccuracy': 0.0,
      },
      'currentAirQuality': 82.5,
      'currentAirQualityCategory': 'Unhealthy for Sensitive Groups',
      'timestamp': DateTime.now().toIso8601String(),
      'additionalData': {
        'weather': 'Partly cloudy',
        'temperature': 22.5,
        'humidity': 65,
        'triggerSource': 'automated_threshold',
      },
    };
  }
}