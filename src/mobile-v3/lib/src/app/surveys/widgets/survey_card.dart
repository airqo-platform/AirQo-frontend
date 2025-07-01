import 'package:flutter/material.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class SurveyCard extends StatelessWidget {
  final Survey survey;
  final VoidCallback onTap;
  final bool showProgress;
  final double? completionPercentage;

  const SurveyCard({
    super.key,
    required this.survey,
    required this.onTap,
    this.showProgress = false,
    this.completionPercentage,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Material(
        color: theme.highlightColor,
        borderRadius: BorderRadius.circular(12),
        elevation: 0,
        shadowColor: Colors.black.withOpacity(0.1),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _buildSurveyIcon(context),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              survey.title,
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.schedule,
                                  size: 14,
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  survey.estimatedTimeString,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.textTheme.bodySmall?.color,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Icon(
                                  Icons.quiz_outlined,
                                  size: 14,
                                  color: theme.textTheme.bodySmall?.color,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${survey.questions.length} questions',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.textTheme.bodySmall?.color,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      _buildTriggerBadge(context),
                    ],
                  ),
                  if (survey.description.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      survey.description,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDarkMode ? Colors.grey[300] : Colors.grey[600],
                        height: 1.4,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (showProgress && completionPercentage != null) ...[
                    const SizedBox(height: 16),
                    _buildProgressIndicator(context),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSurveyIcon(BuildContext context) {
    final theme = Theme.of(context);
    IconData iconData;
    Color iconColor;

    switch (survey.trigger.type) {
      case SurveyTriggerType.locationBased:
        iconData = Icons.location_on;
        iconColor = Colors.blue;
        break;
      case SurveyTriggerType.airQualityThreshold:
        iconData = Icons.air;
        iconColor = Colors.orange;
        break;
      case SurveyTriggerType.timeBased:
        iconData = Icons.schedule;
        iconColor = Colors.green;
        break;
      case SurveyTriggerType.postExposure:
        iconData = Icons.health_and_safety;
        iconColor = Colors.red;
        break;
      default:
        iconData = Icons.quiz;
        iconColor = AppColors.primaryColor;
    }

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: iconColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(
        iconData,
        color: iconColor,
        size: 20,
      ),
    );
  }

  Widget _buildTriggerBadge(BuildContext context) {
    final theme = Theme.of(context);
    String label;
    Color badgeColor;

    switch (survey.trigger.type) {
      case SurveyTriggerType.locationBased:
        label = 'Location';
        badgeColor = Colors.blue;
        break;
      case SurveyTriggerType.airQualityThreshold:
        label = 'Air Quality';
        badgeColor = Colors.orange;
        break;
      case SurveyTriggerType.timeBased:
        label = 'Scheduled';
        badgeColor = Colors.green;
        break;
      case SurveyTriggerType.postExposure:
        label = 'Health';
        badgeColor = Colors.red;
        break;
      default:
        label = 'Manual';
        badgeColor = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: badgeColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(
          color: badgeColor,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildProgressIndicator(BuildContext context) {
    final theme = Theme.of(context);
    final progress = completionPercentage! / 100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progress',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '${completionPercentage!.toInt()}%',
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w500,
                color: AppColors.primaryColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: theme.dividerColor.withOpacity(0.3),
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryColor),
          minHeight: 4,
        ),
      ],
    );
  }
}