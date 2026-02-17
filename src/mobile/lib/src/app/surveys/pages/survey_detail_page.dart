import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/widgets/survey_question_widgets.dart';
import 'package:airqo/src/app/surveys/widgets/survey_progress_indicator.dart';
import 'package:airqo/src/app/shared/widgets/airqo_button.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/surveys/repository/survey_repository.dart';

class SurveyDetailPage extends StatelessWidget {
  final Survey survey;
  final SurveyResponse? existingResponse;
  final SurveyRepository? repository;

  const SurveyDetailPage({
    super.key,
    required this.survey,
    this.existingResponse,
    this.repository,
  });

  @override
  Widget build(BuildContext context) {
    // Use provided repository or try to get from provider, or create a new one
    SurveyRepository repo;
    if (repository != null) {
      repo = repository!;
    } else {
      try {
        repo = RepositoryProvider.of<SurveyRepository>(context);
      } catch (e) {
        repo = SurveyRepository();
      }
    }
    
    return BlocProvider(
      create: (context) => SurveyBloc(repo),
      child: SurveyDetailView(
        survey: survey,
        existingResponse: existingResponse,
      ),
    );
  }
}

class SurveyDetailView extends StatefulWidget {
  final Survey survey;
  final SurveyResponse? existingResponse;

  const SurveyDetailView({
    super.key,
    required this.survey,
    this.existingResponse,
  });

  @override
  State<SurveyDetailView> createState() => _SurveyDetailViewState();
}

class _SurveyDetailViewState extends State<SurveyDetailView> {
  @override
  void initState() {
    super.initState();
    // Track survey detail page view
    AnalyticsService().trackSurveyDetailViewed(surveyId: widget.survey.id);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) {
          // Track survey skipped when user navigates back
          _trackSurveySkipped(context);
        }
      },
      child: Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        appBar: AppBar(
          title: Text(
            widget.survey.title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
        body: BlocConsumer<SurveyBloc, SurveyState>(
          listener: (context, state) {
            if (state is SurveySubmitted) {
              _showSubmissionDialog(context, state);
            } else if (state is SurveyError) {
              _showErrorSnackBar(context, state.message);
            }
          },
          builder: (context, state) {
            if (state is SurveyInProgress) {
              return _buildSurveyInProgress(context, state);
            } else if (state is SurveySubmissionLoading) {
              return _buildSubmissionLoading(context);
            } else {
              return _buildSurveyOverview(context);
            }
          },
        ),
      ),
    );
  }

  Widget _buildSurveyOverview(BuildContext context) {
    final theme = Theme.of(context);
    final isCompleted = widget.existingResponse?.isCompleted ?? false;
    final canResume = widget.existingResponse?.isInProgress ?? false;
    final screenWidth = MediaQuery.of(context).size.width;
    final isLargeScreen = screenWidth > 600;

    return SingleChildScrollView(
      padding: EdgeInsets.all(isLargeScreen ? 32 : 16),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Survey info card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.assignment,
                        color: AppColors.primaryColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.survey.title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  widget.survey.description,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    height: 1.4,
                    color: AppColors.secondaryHeadlineColor,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 20),
                
                // Survey metadata
                Row(
                  children: [
                    _buildInfoItem(
                      icon: Icons.schedule,
                      label: 'Time',
                      value: widget.survey.estimatedTimeString,
                    ),
                    const SizedBox(width: 24),
                    _buildInfoItem(
                      icon: Icons.quiz_outlined,
                      label: 'Questions',
                      value: '${widget.survey.questions.length}',
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Status section
          if (isCompleted) ...[
            _buildCompletedSection(context),
            const SizedBox(height: 24),
          ] else if (canResume) ...[
            _buildResumeSection(context),
            const SizedBox(height: 24),
          ],

          // Action buttons
          _buildActionButtons(context, isCompleted, canResume),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    final theme = Theme.of(context);
    
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.boldHeadlineColor,
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: theme.textTheme.bodySmall?.copyWith(
            color: AppColors.secondaryHeadlineColor,
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildCompletedSection(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: Colors.green),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Survey Completed',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.green,
                  ),
                ),
                Text(
                  'Thank you for your response! Completed on ${_formatDate(widget.existingResponse!.completedAt!)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.green.shade700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResumeSection(BuildContext context) {
    final theme = Theme.of(context);
    final progress = widget.existingResponse!.getCompletionPercentage(widget.survey.questions.length);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.pending, color: Colors.orange),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Resume Survey',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.orange,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'You\'ve completed ${progress.toInt()}% of this survey.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: Colors.orange.shade700,
            ),
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: progress / 100,
            backgroundColor: Colors.orange.withValues(alpha: 0.2),
            valueColor: AlwaysStoppedAnimation<Color>(Colors.orange),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, bool isCompleted, bool canResume) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!isCompleted) ...[
          AirQoButton(
            label: canResume ? 'Resume Survey' : 'Start Survey',
            onPressed: () => _startOrResumeSurvey(context),
            color: AppColors.primaryColor,
            textColor: Colors.white,
          ),
        ],
        
        if (isCompleted) ...[
          AirQoButton(
            label: 'View Results',
            onPressed: () => _viewResults(context),
            color: Colors.transparent,
            textColor: AppColors.primaryColor,
          ),
        ],
      ],
    );
  }

  Widget _buildSurveyInProgress(BuildContext context, SurveyInProgress state) {
    return Column(
      children: [
        // Progress indicator
        SurveyProgressIndicator(
          currentQuestion: state.currentQuestionNumber,
          totalQuestions: state.totalQuestions,
        ),
        
        // Question content
        Expanded(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: MediaQuery.of(context).size.width > 600 ? 32 : 0,
            ),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: 800,
                minHeight: MediaQuery.of(context).size.height * 0.3,
              ),
              child: Column(
                children: [
                  if (state.currentQuestion != null)
                    SurveyQuestionWidget(
                      question: state.currentQuestion!,
                      currentAnswer: state.getCurrentAnswer(),
                      onAnswerChanged: (answer) {
                        context.read<SurveyBloc>().add(
                          AnswerQuestion(state.currentQuestion!.id, answer),
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
        ),
        
        // Navigation buttons
        _buildNavigationButtons(context, state),
      ],
    );
  }

  Widget _buildNavigationButtons(BuildContext context, SurveyInProgress state) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final isLargeScreen = screenWidth > 600;
    
    return Container(
      padding: EdgeInsets.fromLTRB(
        isLargeScreen ? 32 : 16, 
        16, 
        isLargeScreen ? 32 : 16, 
        MediaQuery.of(context).padding.bottom + 16
      ),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Row(
            children: [
          // Previous button
          if (!state.isFirstQuestion)
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  context.read<SurveyBloc>().add(const PreviousQuestion());
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: theme.brightness == Brightness.dark ? Colors.white : const Color(0xFF344054),
                  side: BorderSide(color: theme.brightness == Brightness.dark ? Colors.white70 : const Color(0xFFD0D5DD)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: theme.brightness == Brightness.dark ? Colors.transparent : Colors.white,
                ),
                child: const Text('Previous'),
              ),
            ),
          
          if (!state.isFirstQuestion) const SizedBox(width: 16),
          
          // Next/Submit button
          Expanded(
            flex: state.isFirstQuestion ? 1 : 1,
            child: ElevatedButton(
              onPressed: state.isCurrentQuestionAnswered || 
                       (state.currentQuestion?.isRequired == false)
                  ? () {
                      if (state.isLastQuestion) {
                        context.read<SurveyBloc>().add(const SubmitSurvey());
                      } else {
                        context.read<SurveyBloc>().add(const NextQuestion());
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(
                state.isLastQuestion ? 'Submit' : 'Next',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubmissionLoading(BuildContext context) {
    return const Center(
      child: SurveySubmissionIndicator(
        message: 'Submitting your survey response...',
      ),
    );
  }

  void _startOrResumeSurvey(BuildContext context) {
    context.read<SurveyBloc>().add(StartSurvey(widget.survey));
  }

  void _viewResults(BuildContext context) {
    // Track survey results viewed
    AnalyticsService().trackSurveyResultsViewed(surveyId: widget.survey.id);

    // TODO: Navigate to results page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Results view coming soon!')),
    );
  }

  void _trackSurveySkipped(BuildContext context) {
    // Get current survey state to know which question the user was on
    final state = context.read<SurveyBloc>().state;
    int? currentQuestionNumber;

    if (state is SurveyInProgress) {
      currentQuestionNumber = state.currentQuestionIndex + 1;
    }

    // Track survey skipped event
    AnalyticsService().trackSurveySkipped(
      surveyId: widget.survey.id,
      questionNumber: currentQuestionNumber,
    );
  }

  void _showSubmissionDialog(BuildContext context, SurveySubmitted state) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).brightness == Brightness.dark 
            ? Theme.of(context).cardColor 
            : Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: SurveyCompletionIndicator(
          title: state.submittedSuccessfully 
              ? 'Survey Submitted!' 
              : 'Survey Completed!',
          subtitle: state.submittedSuccessfully
              ? 'Thank you for your participation. Your response helps improve air quality research.'
              : 'Thank you for your participation. Your response has been recorded and will help improve air quality research.',
          isSuccess: true, // Always show as success since survey was completed
          onClose: () {
            Navigator.of(context).pop(); // Close dialog
            Navigator.of(context).pop(); // Return to survey list
          },
        ),
      ),
    );
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}