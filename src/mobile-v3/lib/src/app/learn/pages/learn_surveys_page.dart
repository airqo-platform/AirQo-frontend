import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:collection/collection.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/widgets/survey_card.dart';
import 'package:airqo/src/app/surveys/pages/survey_detail_page.dart';
import 'package:airqo/src/app/surveys/services/survey_notification_service.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class LearnSurveysPage extends StatefulWidget {
  const LearnSurveysPage({super.key});

  @override
  State<LearnSurveysPage> createState() => _LearnSurveysPageState();
}

class _LearnSurveysPageState extends State<LearnSurveysPage> {
  final SurveyNotificationService _notificationService = SurveyNotificationService();

  @override
  void initState() {
    super.initState();
    _loadSurveysIfAuthenticated();
  }

  Future<void> _loadSurveysIfAuthenticated() async {
    final userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    if (mounted && userId != null) {
      context.read<SurveyBloc>().add(const LoadSurveys());
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String?>(
      future: AuthHelper.getCurrentUserId(suppressGuestWarning: true),
      builder: (context, authSnapshot) {
        final isGuest = authSnapshot.data == null;

        if (isGuest) {
          return _buildGuestSignInState();
        }

        return BlocBuilder<SurveyBloc, SurveyState>(
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
        );
      },
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
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            // Survey list
            ...state.surveys.map((survey) {
              final userResponse = state.userResponses
                  .firstWhereOrNull((r) => r.surveyId == survey.id);
              
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildSurveyCardForLearn(
                  survey: survey,
                  userResponse: userResponse,
                ),
              );
            }).toList(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSurveyCardForLearn({
    required Survey survey,
    SurveyResponse? userResponse,
  }) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    
    return GestureDetector(
      onTap: () => _navigateToSurveyDetail(survey, userResponse),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        width: double.infinity,
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      survey.title,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (userResponse == null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'New',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  else if (userResponse.isCompleted)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Completed',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  else if (userResponse.isInProgress)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'In Progress',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
              if (survey.description.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  survey.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDarkMode ? Colors.grey[300] : Colors.grey[600],
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 16),
              Row(
                children: [
                  Icon(
                    Icons.schedule,
                    size: 14,
                    color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    survey.estimatedTimeString,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.quiz_outlined,
                    size: 14,
                    color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${survey.questions.length} questions',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDarkMode ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  Container(
                    height: 32,
                    width: 32,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: AppColors.primaryColor.withOpacity(0.1),
                    ),
                    child: Center(
                      child: Icon(
                        Icons.arrow_forward_ios,
                        color: AppColors.primaryColor,
                        size: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState(SurveyError state) {
    return FutureBuilder<String?>(
      future: AuthHelper.getCurrentUserId(suppressGuestWarning: true),
      builder: (context, snapshot) {
        final theme = Theme.of(context);
        final isGuest = snapshot.data == null;

        return Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isGuest ? Icons.login : Icons.error_outline,
                  size: 64,
                  color: isGuest
                      ? AppColors.primaryColor.withValues(alpha: 0.7)
                      : Colors.red.withValues(alpha: 0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  isGuest ? 'Sign in to access surveys' : 'Unable to load surveys',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  isGuest
                      ? 'Create an account or sign in to participate in research surveys and help improve air quality.'
                      : state.message,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (isGuest) {
                      Navigator.of(context).pushNamed('/auth');
                    } else {
                      context.read<SurveyBloc>().add(const LoadSurveys());
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(isGuest ? 'Sign In' : 'Try Again'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildGuestSignInState() {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.login,
              size: 64,
              color: AppColors.primaryColor.withValues(alpha: 0.7),
            ),
            const SizedBox(height: 16),
            Text(
              'Sign in to access surveys',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Create an account or sign in to participate in research surveys and help improve air quality.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pushNamed('/auth');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Sign In'),
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
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.3),
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
                color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
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
    ).then((_) {
      // Refresh surveys when returning from detail page
      context.read<SurveyBloc>().add(const LoadSurveys());
    });
  }
}

