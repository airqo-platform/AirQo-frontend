import 'package:airqo/src/app/shared/widgets/empty_state_view.dart';
import 'package:airqo/src/app/shared/widgets/system_glyph.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/models/survey_response_model.dart';
import 'package:airqo/src/app/surveys/pages/survey_detail_page.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Surveys sub-tab inside Learn — matches the research-app experience.
class LearnSurveysPage extends StatefulWidget {
  const LearnSurveysPage({super.key});

  @override
  State<LearnSurveysPage> createState() => _LearnSurveysPageState();
}

class _LearnSurveysPageState extends State<LearnSurveysPage> {
  @override
  void initState() {
    super.initState();
    _loadSurveys();
  }

  void _loadSurveys() {
    if (mounted) {
      context.read<SurveyBloc>().add(const LoadSurveys());
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SurveyBloc, SurveyState>(
      builder: (context, state) {
        if (state is SurveyLoading || state is SurveyInitial) {
          return _buildLoadingState();
        } else if (state is SurveysLoaded) {
          return _buildSurveysLoadedState(state);
        } else if (state is SurveyError) {
          return _buildErrorState();
        } else {
          return _buildEmptyState();
        }
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
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildSurveyCardForLearn({
    required Survey survey,
    SurveyResponse? userResponse,
  }) {
    return GestureDetector(
      onTap: () => _navigateToSurveyDetail(survey, userResponse),
      child: Container(
        width: double.infinity,
        decoration: AppSurfaceColors.elevatedCardDecoration(context),
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
                        color: AppTextColors.headline(context),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (userResponse == null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const TranslatedText(
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const TranslatedText(
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const TranslatedText(
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
                    color: AppTextColors.muted(context),
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
                    color: AppTextColors.subtitle(context),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    survey.estimatedTimeString,
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTextColors.subtitle(context),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(
                    Icons.quiz_outlined,
                    size: 14,
                    color: AppTextColors.subtitle(context),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${survey.questions.length} questions',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTextColors.subtitle(context),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    height: 32,
                    width: 32,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: AppColors.primaryColor.withValues(alpha: 0.1),
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

  Widget _buildErrorState() {
    return EmptyStateView(
      icon: SystemGlyph.error(context),
      title: 'Unable to load surveys',
      message: "We couldn't load surveys right now. Please try again.",
      actionLabel: 'Try Again',
      onAction: () {
        context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
      },
    );
  }

  Widget _buildEmptyState() {
    return EmptyStateView(
      icon: SystemGlyph.emptySurvey(context),
      title: 'No surveys available',
      message: "We couldn't find any surveys right now. Please try again.",
      actionLabel: 'Try Again',
      onAction: () {
        context.read<SurveyBloc>().add(const LoadSurveys(forceRefresh: true));
      },
    );
  }

  void _navigateToSurveyDetail(
    Survey survey,
    SurveyResponse? existingResponse,
  ) {
    Navigator.of(context)
        .push(
      MaterialPageRoute(
        settings: const RouteSettings(name: 'survey_detail'),
        builder: (context) => SurveyDetailPage(
          survey: survey,
          existingResponse: existingResponse,
        ),
      ),
    )
        .then((_) {
      if (!mounted) return;
      context.read<SurveyBloc>().add(const LoadSurveys());
    });
  }
}
