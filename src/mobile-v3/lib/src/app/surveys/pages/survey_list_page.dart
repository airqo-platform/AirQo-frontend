import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/widgets/survey_card.dart';
import 'package:airqo/src/app/surveys/pages/survey_detail_page.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class SurveyListPage extends StatefulWidget {
  const SurveyListPage({super.key});

  @override
  State<SurveyListPage> createState() => _SurveyListPageState();
}

class _SurveyListPageState extends State<SurveyListPage> {
  @override
  void initState() {
    super.initState();
    context.read<SurveyBloc>().add(const LoadSurveys());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Research Surveys',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
            },
          ),
        ],
      ),
      body: BlocBuilder<SurveyBloc, SurveyState>(
        builder: (context, state) {
          if (state is SurveyLoading) {
            return _buildLoadingState();
          } else if (state is SurveysLoaded) {
            return _buildSurveysLoadedState(state);
          } else if (state is SurveyError) {
            return _buildErrorState(state);
          } else {
            return _buildEmptyState();
          }
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
      ),
    );
  }

  Widget _buildSurveysLoadedState(SurveysLoaded state) {
    if (state.surveys.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: () async {
        context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header section
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Available Surveys',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Help us understand how air quality affects your daily life. Your responses are confidential and help improve air quality research.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).textTheme.bodyMedium?.color?.withOpacity(0.7),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Statistics card
                _buildStatsCard(state),
              ],
            ),
          ),
          
          // Survey list
          Expanded(
            child: ListView.builder(
              itemCount: state.surveys.length,
              itemBuilder: (context, index) {
                final survey = state.surveys[index];
                final userResponse = state.userResponses
                    .where((r) => r.surveyId == survey.id)
                    .firstOrNull;
                
                return SurveyCard(
                  survey: survey,
                  showProgress: userResponse != null && userResponse.isInProgress,
                  completionPercentage: userResponse?.getCompletionPercentage(survey.questions.length),
                  onTap: () => _navigateToSurveyDetail(survey, userResponse),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard(SurveysLoaded state) {
    final theme = Theme.of(context);
    final completedCount = state.userResponses.where((r) => r.isCompleted).length;
    final inProgressCount = state.userResponses.where((r) => r.isInProgress).length;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildStatItem(
            icon: Icons.check_circle,
            label: 'Completed',
            value: completedCount.toString(),
            color: Colors.green,
          ),
          const SizedBox(width: 24),
          _buildStatItem(
            icon: Icons.pending,
            label: 'In Progress',
            value: inProgressCount.toString(),
            color: Colors.orange,
          ),
          const SizedBox(width: 24),
          _buildStatItem(
            icon: Icons.quiz,
            label: 'Available',
            value: state.surveys.length.toString(),
            color: AppColors.primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    final theme = Theme.of(context);
    
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(SurveyError state) {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Oops! Something went wrong',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              state.message,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                context.read<SurveyBloc>().add(const LoadSurveys());
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    final theme = Theme.of(context);
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.quiz_outlined,
              size: 64,
              color: theme.textTheme.bodyMedium?.color?.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'No surveys available',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Check back later for new research surveys.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withOpacity(0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            TextButton(
              onPressed: () {
                context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
              },
              child: const Text('Refresh'),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToSurveyDetail(Survey survey, SurveyResponse? existingResponse) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => SurveyDetailPage(
          survey: survey,
          existingResponse: existingResponse,
        ),
      ),
    );
  }
}