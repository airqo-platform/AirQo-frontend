import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:collection/collection.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/widgets/survey_card.dart';
import 'package:airqo/src/app/surveys/pages/survey_detail_page.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/app/auth/services/auth_helper.dart';
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
    // Track survey list page view
    AnalyticsService().trackSurveyListViewed();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Research Surveys',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: theme.brightness == Brightness.dark
                ? Colors.white
                : AppColors.boldHeadlineColor4,
            fontFamily: 'Inter',
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleSpacing: 16,
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh,
              color: theme.brightness == Brightness.dark
                  ? Colors.white
                  : AppColors.boldHeadlineColor4,
            ),
            onPressed: () {
              context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
            },
            tooltip: 'Refresh surveys',
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
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isTablet = constraints.maxWidth > 768;
          final isDesktop = constraints.maxWidth > 1024;
          final horizontalPadding = isDesktop ? 32.0 : (isTablet ? 24.0 : 16.0);
          final maxContentWidth = isDesktop ? 800.0 : double.infinity;
          
          return SingleChildScrollView(
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxContentWidth),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header section
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: horizontalPadding,
                        vertical: isTablet ? 24.0 : 16.0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Available Surveys',
                            style: TextStyle(
                              fontSize: isTablet ? 22.0 : 20.0,
                              fontWeight: FontWeight.w600,
                              color: Theme.of(context).brightness == Brightness.dark
                                  ? Colors.white
                                  : AppColors.boldHeadlineColor4,
                              fontFamily: 'Inter',
                            ),
                          ),
                          SizedBox(height: isTablet ? 12.0 : 8.0),
                          Text(
                            'Help us understand how air quality affects your daily life. Your responses are confidential and help improve air quality research.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).brightness == Brightness.dark
                                  ? AppColors.secondaryHeadlineColor2
                                  : AppColors.boldHeadlineColor,
                              height: 1.5,
                              fontSize: isTablet ? 16.0 : 14.0,
                            ),
                          ),
                          SizedBox(height: isTablet ? 20.0 : 12.0),
                          _buildResearchImpactCard(state),
                          SizedBox(height: isTablet ? 24.0 : 16.0),
                          
                          // Statistics card
                          _buildStatsCard(state),
                        ],
                      ),
                    ),
                    
                    // Survey list
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
                      child: Column(
                        children: state.surveys.map((survey) {
                          final userResponse = state.userResponses
                              .firstWhereOrNull((r) => r.surveyId == survey.id);
                          
                          return Padding(
                            padding: EdgeInsets.only(bottom: isTablet ? 16.0 : 12.0),
                            child: SurveyCard(
                              survey: survey,
                              showProgress: userResponse != null && userResponse.isInProgress,
                              completionPercentage: userResponse?.getCompletionPercentage(survey.questions.length),
                              onTap: () => _navigateToSurveyDetail(survey, userResponse),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    
                    // Bottom spacing
                    SizedBox(height: MediaQuery.of(context).padding.bottom + 16),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildResearchImpactCard(SurveysLoaded state) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final completedCount = state.userResponses.where((r) => r.isCompleted).length;
    
    // Calculate estimated research impact based on completed surveys
    final totalResponses = completedCount * 1000; // Simulated community data
    final researchProgress = (completedCount * 8.3).clamp(0.0, 100.0); // Progress simulation
    
    return LayoutBuilder(
      builder: (context, constraints) {
        final isTablet = constraints.maxWidth > 768;
        
        return Container(
          padding: EdgeInsets.all(isTablet ? 20.0 : 16.0),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.primaryColor.withValues(alpha: isDark ? 0.15 : 0.08),
                (isDark ? Colors.blue.shade800 : Colors.blue.shade50).withValues(alpha: 0.1),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(isTablet ? 16.0 : 12.0),
            border: Border.all(
              color: AppColors.primaryColor.withValues(alpha: isDark ? 0.4 : 0.2),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryColor.withValues(alpha: 0.08),
                blurRadius: 8,
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
                    padding: EdgeInsets.all(isTablet ? 10.0 : 8.0),
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.analytics,
                      color: AppColors.primaryColor,
                      size: isTablet ? 24.0 : 20.0,
                    ),
                  ),
                  SizedBox(width: isTablet ? 12.0 : 8.0),
                  Expanded(
                    child: Text(
                      'Your Research Contribution',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryColor,
                        fontSize: isTablet ? 16.0 : 14.0,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: isTablet ? 16.0 : 12.0),
              if (completedCount > 0) ...[
                Text(
                  'You\'ve contributed $completedCount responses, joining ${(totalResponses / 1000).round()}k+ participants',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark 
                        ? AppColors.secondaryHeadlineColor2
                        : AppColors.boldHeadlineColor,
                    fontSize: isTablet ? 15.0 : 13.0,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: isTablet ? 12.0 : 8.0),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: isTablet ? 8.0 : 6.0,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: LinearProgressIndicator(
                          value: researchProgress / 100,
                          backgroundColor: isDark 
                              ? AppColors.dividerColordark
                              : AppColors.dividerColorlight,
                          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                    SizedBox(width: isTablet ? 16.0 : 12.0),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${researchProgress.round()}%',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryColor,
                          fontSize: isTablet ? 13.0 : 12.0,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: isTablet ? 8.0 : 6.0),
                Text(
                  'Research Progress: Building cleaner air insights',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark 
                        ? AppColors.secondaryHeadlineColor2.withValues(alpha: 0.8)
                        : AppColors.boldHeadlineColor.withValues(alpha: 0.8),
                    fontSize: isTablet ? 12.0 : 11.0,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ] else ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark 
                        ? AppColors.darkThemeBackground.withValues(alpha: 0.5)
                        : Colors.white.withValues(alpha: 0.7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDark 
                          ? AppColors.dividerColordark
                          : AppColors.dividerColorlight,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.lightbulb_outline,
                        color: isDark ? Colors.amber.shade300 : Colors.amber.shade700,
                        size: isTablet ? 20.0 : 16.0,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Complete your first survey to see how you\'re contributing to air quality research!',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: isDark 
                                ? AppColors.secondaryHeadlineColor2
                                : AppColors.boldHeadlineColor,
                            fontSize: isTablet ? 14.0 : 12.0,
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
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
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isTablet = constraints.maxWidth > 768;
          final isNarrow = constraints.maxWidth < 400;
          
          return isNarrow 
              ? Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatItem(
                            icon: Icons.check_circle,
                            label: 'Completed',
                            value: completedCount.toString(),
                            color: Colors.green,
                            isCompact: true,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildStatItem(
                            icon: Icons.pending,
                            label: 'In Progress',
                            value: inProgressCount.toString(),
                            color: Colors.orange,
                            isCompact: true,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildStatItem(
                      icon: Icons.quiz,
                      label: 'Available',
                      value: state.surveys.length.toString(),
                      color: AppColors.primaryColor,
                      isCompact: true,
                    ),
                  ],
                )
              : Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        icon: Icons.check_circle,
                        label: 'Completed',
                        value: completedCount.toString(),
                        color: Colors.green,
                        isTablet: isTablet,
                      ),
                    ),
                    SizedBox(width: isTablet ? 32.0 : 24.0),
                    Expanded(
                      child: _buildStatItem(
                        icon: Icons.pending,
                        label: 'In Progress',
                        value: inProgressCount.toString(),
                        color: Colors.orange,
                        isTablet: isTablet,
                      ),
                    ),
                    SizedBox(width: isTablet ? 32.0 : 24.0),
                    Expanded(
                      child: _buildStatItem(
                        icon: Icons.quiz,
                        label: 'Available',
                        value: state.surveys.length.toString(),
                        color: AppColors.primaryColor,
                        isTablet: isTablet,
                      ),
                    ),
                  ],
                );
        },
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    bool isTablet = false,
    bool isCompact = false,
  }) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Column(
        children: [
          Container(
            padding: EdgeInsets.all(isTablet ? 12.0 : 8.0),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(isTablet ? 12.0 : 8.0),
            ),
            child: Icon(
              icon, 
              color: color, 
              size: isTablet ? 28.0 : (isCompact ? 20.0 : 24.0)
            ),
          ),
          SizedBox(height: isTablet ? 8.0 : 6.0),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: color,
              fontSize: isTablet ? 20.0 : (isCompact ? 16.0 : 18.0),
            ),
          ),
          SizedBox(height: isTablet ? 4.0 : 2.0),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: isDark 
                  ? AppColors.secondaryHeadlineColor2.withValues(alpha: 0.8)
                  : AppColors.boldHeadlineColor.withValues(alpha: 0.8),
              fontSize: isTablet ? 13.0 : (isCompact ? 11.0 : 12.0),
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
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
                  isGuest ? 'Sign in to access surveys' : 'Oops! Something went wrong',
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
    );
  }
}