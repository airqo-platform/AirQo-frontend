import 'package:flutter/material.dart';
import 'package:airqo/src/app/shared/services/notification_manager.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class AirQualityAlertTestPage extends StatelessWidget {
  const AirQualityAlertTestPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Air Quality Alert Tests'),
        backgroundColor: AppColors.primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Test Air Quality Alerts',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              
              // Good Air Quality
              _buildTestButton(
                context: context,
                title: '🟢 Good Air Quality',
                category: 'Good',
                message: 'Air quality is satisfactory for most people.',
                pollutionLevel: 15.2,
              ),
              
              // Moderate Air Quality
              _buildTestButton(
                context: context,
                title: '🟡 Moderate Air Quality',
                category: 'Moderate',
                message: 'Air quality is acceptable for most people.',
                pollutionLevel: 35.5,
              ),
              
              // Unhealthy for Sensitive Groups
              _buildTestButton(
                context: context,
                title: '🟠 Unhealthy for Sensitive Groups',
                category: 'Unhealthy for Sensitive Groups',
                message: 'Air quality may affect sensitive individuals. Take precautions.',
                pollutionLevel: 65.8,
              ),
              
              // Unhealthy Air Quality
              _buildTestButton(
                context: context,
                title: '🔴 Unhealthy Air Quality',
                category: 'Unhealthy',
                message: 'Unhealthy air quality detected! Consider limiting outdoor activities.',
                pollutionLevel: 120.3,
              ),
              
              // Very Unhealthy Air Quality
              _buildTestButton(
                context: context,
                title: '🔴 Very Unhealthy Air Quality',
                category: 'Very Unhealthy',
                message: 'Very unhealthy air quality! Avoid prolonged outdoor exposure.',
                pollutionLevel: 200.7,
              ),
              
              // Hazardous Air Quality
              _buildTestButton(
                context: context,
                title: '🔴 Hazardous Air Quality',
                category: 'Hazardous',
                message: 'Hazardous air quality! Stay indoors and close windows.',
                pollutionLevel: 350.1,
              ),
              
              const SizedBox(height: 30),
              
              const Text(
                'Test Survey Notifications',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              
              // Survey Dialog Test
              ElevatedButton(
                onPressed: () => _showSurveyDialog(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('📋 Test Survey Dialog'),
              ),
              
              const SizedBox(height: 12),
              
              // Survey Banner Test
              ElevatedButton(
                onPressed: () => _showSurveyBanner(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('🔔 Test Survey Banner'),
              ),
              
              const SizedBox(height: 30),
              
              const Text(
                'Instructions:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '• Tap any air quality button to see the alert notification\n'
                '• Alerts show for 5 seconds or until dismissed\n'
                '• Each alert uses category-specific icons and colors\n'
                '• Survey notifications appear after air quality alerts\n'
                '• Test different categories to see visual differences',
                style: TextStyle(fontSize: 14, height: 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTestButton({
    required BuildContext context,
    required String title,
    required String category,
    required String message,
    required double pollutionLevel,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ElevatedButton(
        onPressed: () {
          NotificationManager().showAirQualityAlert(
            context,
            message: message,
            category: category,
            pollutionLevel: pollutionLevel,
            onDismiss: () {
              print('$category alert dismissed');
            },
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          side: BorderSide(color: Colors.grey.shade300),
          padding: const EdgeInsets.symmetric(vertical: 16),
          elevation: 1,
        ),
        child: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
      ),
    );
  }

  void _showSurveyDialog(BuildContext context) {
    final testSurvey = Survey(
      id: 'test_survey_dialog',
      title: 'Air Quality Experience Survey',
      description: 'Help us understand how air quality affects your daily activities and health.',
      questions: [
        SurveyQuestion(
          id: 'q1',
          question: 'Did you receive an air quality alert today?',
          type: QuestionType.yesNo,
          isRequired: true,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.airQualityThreshold,
        conditions: {},
      ),
      timeToComplete: const Duration(minutes: 2),
      isActive: true,
      createdAt: DateTime.now(),
    );

    NotificationManager().showSurveyNotification(
      context,
      survey: testSurvey,
      onTakeSurvey: () {
        print('User chose to take survey');
      },
      onDismiss: () {
        print('User dismissed survey dialog');
      },
    );
  }

  void _showSurveyBanner(BuildContext context) {
    final testSurvey = Survey(
      id: 'test_survey_banner',
      title: 'Quick Air Quality Survey',
      description: 'A brief survey about your recent air quality experience.',
      questions: [
        SurveyQuestion(
          id: 'q1',
          question: 'How did the air quality alert affect your plans?',
          type: QuestionType.multipleChoice,
          options: ['Changed outdoor plans', 'Stayed indoors', 'No change', 'Other'],
          isRequired: true,
        ),
      ],
      trigger: SurveyTrigger(
        type: SurveyTriggerType.airQualityThreshold,
        conditions: {},
      ),
      timeToComplete: const Duration(minutes: 1),
      isActive: true,
      createdAt: DateTime.now(),
    );

    NotificationManager().showSurveyBanner(
      context,
      survey: testSurvey,
      onTap: () {
        print('User tapped survey banner');
      },
      onDismiss: () {
        print('User dismissed survey banner');
      },
    );
  }
}