import 'package:flutter/material.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class SurveyQuestionWidget extends StatelessWidget {
  final SurveyQuestion question;
  final dynamic currentAnswer;
  final Function(dynamic) onAnswerChanged;
  final bool isRequired;

  const SurveyQuestionWidget({
    super.key,
    required this.question,
    this.currentAnswer,
    required this.onAnswerChanged,
    this.isRequired = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question Header
          RichText(
            text: TextSpan(
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor,
                height: 1.4,
              ),
              children: [
                TextSpan(text: question.question),
                if (question.isRequired)
                  TextSpan(
                    text: ' *',
                    style: TextStyle(color: Colors.red[600]),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Question Input based on type
          _buildQuestionInput(context),
        ],
      ),
    );
  }

  Widget _buildQuestionInput(BuildContext context) {
    switch (question.type) {
      case QuestionType.multipleChoice:
        return _buildMultipleChoice(context);
      case QuestionType.rating:
        return _buildRating(context);
      case QuestionType.scale:
        return _buildScale(context);
      case QuestionType.yesNo:
        return _buildYesNo(context);
      case QuestionType.text:
        return _buildTextInput(context);
      default:
        return _buildTextInput(context);
    }
  }

  Widget _buildMultipleChoice(BuildContext context) {
    final theme = Theme.of(context);
    final options = question.options ?? [];

    return Column(
      children: options.asMap().entries.map((entry) {
        final index = entry.key;
        final option = entry.value;
        final isSelected = currentAnswer == option;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => onAnswerChanged(option),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isSelected 
                        ? AppColors.primaryColor 
                        : theme.dividerColor,
                    width: isSelected ? 2 : 1,
                  ),
                  borderRadius: BorderRadius.circular(8),
                  color: isSelected
                      ? AppColors.primaryColor.withOpacity(0.05)
                      : Colors.transparent,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected 
                              ? AppColors.primaryColor 
                              : theme.dividerColor,
                          width: 2,
                        ),
                        color: isSelected 
                            ? AppColors.primaryColor 
                            : Colors.transparent,
                      ),
                      child: isSelected
                          ? const Icon(
                              Icons.check,
                              size: 12,
                              color: Colors.white,
                            )
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        option,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: isSelected 
                              ? AppColors.primaryColor 
                              : theme.textTheme.bodyMedium?.color,
                          fontWeight: isSelected 
                              ? FontWeight.w500 
                              : FontWeight.normal,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRating(BuildContext context) {
    final theme = Theme.of(context);
    final maxValue = question.maxValue ?? 5;
    final currentRating = currentAnswer as int? ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(maxValue, (index) {
            final rating = index + 1;
            final isSelected = rating <= currentRating;
            
            return GestureDetector(
              onTap: () => onAnswerChanged(rating),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isSelected 
                      ? AppColors.primaryColor 
                      : Colors.transparent,
                  border: Border.all(
                    color: isSelected 
                        ? AppColors.primaryColor 
                        : theme.dividerColor,
                    width: 2,
                  ),
                ),
                child: Icon(
                  Icons.star,
                  color: isSelected 
                      ? Colors.white 
                      : theme.textTheme.bodyMedium?.color?.withOpacity(0.3),
                  size: 20,
                ),
              ),
            );
          }),
        ),
        if (currentRating > 0) ...[
          const SizedBox(height: 12),
          Center(
            child: Text(
              '$currentRating out of $maxValue',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.primaryColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildScale(BuildContext context) {
    final theme = Theme.of(context);
    final minValue = (question.minValue ?? 1).toDouble();
    final maxValue = (question.maxValue ?? 10).toDouble();
    final currentValue = (currentAnswer as double?) ?? minValue;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              minValue.toInt().toString(),
              style: theme.textTheme.bodySmall,
            ),
            Text(
              maxValue.toInt().toString(),
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: AppColors.primaryColor,
            inactiveTrackColor: theme.dividerColor,
            thumbColor: AppColors.primaryColor,
            overlayColor: AppColors.primaryColor.withOpacity(0.2),
            trackHeight: 4,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
          ),
          child: Slider(
            value: currentValue,
            min: minValue,
            max: maxValue,
            divisions: (maxValue - minValue).toInt(),
            onChanged: (value) => onAnswerChanged(value),
          ),
        ),
        Text(
          'Selected: ${currentValue.toInt()}',
          style: theme.textTheme.bodySmall?.copyWith(
            color: AppColors.primaryColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildYesNo(BuildContext context) {
    final theme = Theme.of(context);
    final currentBool = currentAnswer as bool?;

    return Row(
      children: [
        Expanded(
          child: _buildYesNoOption(
            context: context,
            label: 'Yes',
            value: true,
            isSelected: currentBool == true,
            onTap: () => onAnswerChanged(true),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildYesNoOption(
            context: context,
            label: 'No',
            value: false,
            isSelected: currentBool == false,
            onTap: () => onAnswerChanged(false),
          ),
        ),
      ],
    );
  }

  Widget _buildYesNoOption({
    required BuildContext context,
    required String label,
    required bool value,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            border: Border.all(
              color: isSelected 
                  ? AppColors.primaryColor 
                  : theme.dividerColor,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(8),
            color: isSelected
                ? AppColors.primaryColor.withOpacity(0.05)
                : Colors.transparent,
          ),
          child: Center(
            child: Text(
              label,
              style: theme.textTheme.titleMedium?.copyWith(
                color: isSelected 
                    ? AppColors.primaryColor 
                    : theme.textTheme.bodyMedium?.color,
                fontWeight: isSelected 
                    ? FontWeight.w600 
                    : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextInput(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return TextField(
      onChanged: onAnswerChanged,
      maxLines: question.type == QuestionType.text ? 4 : 1,
      decoration: InputDecoration(
        hintText: question.placeholder ?? 'Enter your answer...',
        hintStyle: theme.textTheme.bodyMedium?.copyWith(
          color: theme.textTheme.bodyMedium?.color?.withOpacity(0.5),
        ),
        filled: true,
        fillColor: theme.highlightColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: theme.dividerColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.primaryColor, width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: theme.dividerColor),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      style: theme.textTheme.bodyMedium,
    );
  }
}