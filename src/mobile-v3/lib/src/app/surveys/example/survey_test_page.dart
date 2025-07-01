import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';
import 'package:airqo/src/app/surveys/services/survey_trigger_service.dart';
import 'package:airqo/src/app/surveys/example/example_survey_data.dart';
import 'package:airqo/src/app/surveys/pages/survey_list_page.dart';
import 'package:airqo/src/meta/utils/colors.dart';

/// Test page for demonstrating survey system functionality
/// This can be accessed during development to test survey features
class SurveyTestPage extends StatefulWidget {
  const SurveyTestPage({super.key});

  @override
  State<SurveyTestPage> createState() => _SurveyTestPageState();
}

class _SurveyTestPageState extends State<SurveyTestPage> {
  final SurveyTriggerService _triggerService = SurveyTriggerService();
  late SurveyRepository _repository;

  @override
  void initState() {
    super.initState();
    _repository = SurveyRepository();
    _initializeTestData();
  }

  Future<void> _initializeTestData() async {
    try {
      // Initialize trigger service
      await _triggerService.initialize();
      
      // Set example surveys as active
      final exampleSurveys = ExampleSurveyData.getAllExampleSurveys();
      _triggerService.setActiveSurveys(exampleSurveys);
      
      // Listen to survey triggers
      _triggerService.surveyTriggeredStream.listen((survey) {
        _showSurveyTriggeredDialog(survey);
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Survey test environment initialized'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error initializing test data: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Survey System Test'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.info, color: Colors.blue),
                      const SizedBox(width: 8),
                      Text(
                        'Survey System Test Environment',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'This page demonstrates the survey system functionality with example data. Use the buttons below to test different survey triggers and features.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.blue.shade700,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Survey management section
            Text(
              'Survey Management',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            
            _buildTestButton(
              'View Survey List',
              'Open the survey list page with example surveys',
              Icons.list,
              _openSurveyList,
            ),
            
            _buildTestButton(
              'Load Example Surveys',
              'Load example surveys into the system',
              Icons.download,
              _loadExampleSurveys,
            ),
            
            const SizedBox(height: 24),
            
            // Trigger testing section
            Text(
              'Trigger Testing',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            
            _buildTestButton(
              'Trigger Post-Exposure Survey',
              'Simulate high pollution exposure trigger',
              Icons.air,
              () => _triggerSurvey('post_exposure_001'),
            ),
            
            _buildTestButton(
              'Trigger Location Survey',
              'Simulate entering a school zone',
              Icons.location_on,
              () => _triggerSurvey('location_001'),
            ),
            
            _buildTestButton(
              'Trigger Daily Survey',
              'Simulate daily check-in time',
              Icons.schedule,
              () => _triggerSurvey('daily_001'),
            ),
            
            _buildTestButton(
              'Trigger Threshold Survey',
              'Simulate air quality threshold exceeded',
              Icons.warning,
              () => _triggerSurvey('threshold_001'),
            ),
            
            const SizedBox(height: 24),
            
            // System testing section
            Text(
              'System Testing',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            
            _buildTestButton(
              'View Trigger Statistics',
              'Show trigger history and statistics',
              Icons.analytics,
              _showTriggerStats,
            ),
            
            _buildTestButton(
              'Clear Test Data',
              'Clear all test surveys and responses',
              Icons.clear_all,
              _clearTestData,
            ),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTestButton(
    String title,
    String description,
    IconData icon,
    VoidCallback onPressed,
  ) {
    final theme = Theme.of(context);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: AppColors.primaryColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: theme.textTheme.bodySmall?.color?.withOpacity(0.5),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openSurveyList() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => BlocProvider(
          create: (context) => SurveyBloc(_repository),
          child: const SurveyListPage(),
        ),
      ),
    );
  }

  Future<void> _loadExampleSurveys() async {
    try {
      // In a real implementation, this would save to the repository
      // For now, we'll just show the surveys are available
      final surveys = ExampleSurveyData.getAllExampleSurveys();
      _triggerService.setActiveSurveys(surveys);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Loaded ${surveys.length} example surveys'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading surveys: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _triggerSurvey(String surveyId) async {
    try {
      final contextData = ExampleSurveyData.createSampleContextData();
      final success = await _triggerService.triggerSurvey(
        surveyId,
        contextData: contextData,
      );
      
      if (!success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to trigger survey'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error triggering survey: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showTriggerStats() {
    final stats = _triggerService.getTriggerStatistics();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Trigger Statistics'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Total Triggers: ${stats['totalTriggers']}'),
            Text('Unique Surveys: ${stats['uniqueSurveys']}'),
            Text('Active Surveys: ${stats['activeSurveys']}'),
            const SizedBox(height: 16),
            const Text('Triggers by Type:'),
            ...((stats['triggersByType'] as Map<String, int>).entries
                .map((e) => Text('  ${e.key}: ${e.value}'))),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _clearTestData() async {
    try {
      await _triggerService.clearTriggerHistory();
      await _repository.clearCache();
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Test data cleared'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error clearing data: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showSurveyTriggeredDialog(Survey survey) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.notification_important, color: AppColors.primaryColor),
            const SizedBox(width: 8),
            const Text('Survey Triggered!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              survey.title,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(survey.description),
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(Icons.schedule, size: 16),
                const SizedBox(width: 4),
                Text('~${survey.estimatedTimeString}'),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Navigate to survey
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Survey navigation coming soon!')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
            ),
            child: const Text('Take Survey'),
          ),
        ],
      ),
    );
  }
}