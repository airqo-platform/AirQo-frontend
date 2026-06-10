import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/surveys/bloc/survey_bloc.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/app/surveys/services/survey_notification_service.dart';
import 'package:airqo/src/app/learn/pages/kya_page.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class NewSurveyBanner extends StatefulWidget {
  const NewSurveyBanner({super.key});

  @override
  State<NewSurveyBanner> createState() => _NewSurveyBannerState();
}

class _NewSurveyBannerState extends State<NewSurveyBanner> {
  final SurveyNotificationService _notificationService = SurveyNotificationService();
  bool _isDismissed = false;

  @override
  Widget build(BuildContext context) {
    if (_isDismissed) return const SizedBox.shrink();

    return BlocBuilder<SurveyBloc, SurveyState>(
      builder: (context, state) {
        if (state is! SurveysLoaded) {
          return const SizedBox.shrink();
        }

        return FutureBuilder<Survey?>(
          future: _notificationService.getMostRecentNewSurvey(
            state.surveys,
            state.userResponses,
          ),
          builder: (context, snapshot) {
            if (!snapshot.hasData || snapshot.data == null) {
              return const SizedBox.shrink();
            }

            final survey = snapshot.data!;

            // Check if dismissed (also async)
            return FutureBuilder<bool>(
              future: _notificationService.isBannerDismissed(survey.id),
              builder: (context, dismissedSnapshot) {
                if (!dismissedSnapshot.hasData || dismissedSnapshot.data == true) {
                  return const SizedBox.shrink();
                }

                return _buildBanner(survey);
              },
            );
          },
        );
      },
    );
  }

  Widget _buildBanner(Survey survey) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryColor.withValues(alpha: isDark ? 0.2 : 0.1),
            AppColors.primaryColor.withValues(alpha: isDark ? 0.15 : 0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.primaryColor.withValues(alpha: isDark ? 0.4 : 0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primaryColor.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.quiz,
              color: AppColors.primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'New Survey Available',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.primaryColor,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  survey.title,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isDark ? Colors.grey[300] : Colors.grey[700],
                    fontSize: 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const KyaPage(initialIndex: 1),
                ),
              );
            },
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              backgroundColor: AppColors.primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text(
              'View',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: () async {
              await _notificationService.dismissBanner(survey.id);
              if (mounted) {
                setState(() {
                  _isDismissed = true;
                });
              }
            },
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                Icons.close,
                size: 16,
                color: isDark ? Colors.grey[300] : Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

