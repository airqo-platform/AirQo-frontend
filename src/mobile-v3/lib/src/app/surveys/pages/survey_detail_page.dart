import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/widgets/survey_question_widgets.dart';
import 'package:airqo/src/app/surveys/widgets/survey_progress_indicator.dart';
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
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          widget.survey.title,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
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
    );
  }

  Widget _buildSurveyOverview(BuildContext context) {
    final theme = Theme.of(context);
    final isCompleted = widget.existingResponse?.isCompleted ?? false;
    final canResume = widget.existingResponse?.isInProgress ?? false;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Survey info card
          Container(
            padding: const EdgeInsets.all(20),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.quiz,
                      color: AppColors.primaryColor,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      widget.survey.title,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  widget.survey.description,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    height: 1.5,
                    color: theme.textTheme.bodyMedium?.color?.withOpacity(0.8),
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
          color: theme.textTheme.bodySmall?.color,
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
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
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green.withOpacity(0.3)),
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
        color: Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
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
            backgroundColor: Colors.orange.withOpacity(0.2),
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
          ElevatedButton(
            onPressed: () => _startOrResumeSurvey(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              canResume ? 'Resume Survey' : 'Start Survey',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
        
        if (isCompleted) ...[
          OutlinedButton(
            onPressed: () => _viewResults(context),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'View Results',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
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
        
        // Navigation buttons
        _buildNavigationButtons(context, state),
      ],
    );
  }

  Widget _buildNavigationButtons(BuildContext context, SurveyInProgress state) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
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
                  padding: const EdgeInsets.symmetric(vertical: 16),
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
    // TODO: Navigate to results page
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Results view coming soon!')),
    );
  }

  void _showSubmissionDialog(BuildContext context, SurveySubmitted state) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: SurveyCompletionIndicator(
          title: state.submittedSuccessfully 
              ? 'Survey Submitted!' 
              : 'Survey Saved!',
          subtitle: state.submittedSuccessfully
              ? 'Thank you for your participation. Your response helps improve air quality research.'
              : 'Your response was saved locally and will be submitted when you\'re back online.',
          isSuccess: state.submittedSuccessfully,
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