import 'package:flutter/material.dart';
import 'package:airqo/src/app/surveys/models/survey_model.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class SurveyQuestionWidget extends StatefulWidget {
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
  State<SurveyQuestionWidget> createState() => _SurveyQuestionWidgetState();
}

class _SurveyQuestionWidgetState extends State<SurveyQuestionWidget> {
  TextEditingController? _textController;

  @override
  void initState() {
    super.initState();
    if (widget.question.type == QuestionType.text) {
      _textController = TextEditingController(
        text: widget.currentAnswer?.toString() ?? '',
      );
      _textController!.addListener(_onTextChanged);
    }
  }

  @override
  void didUpdateWidget(SurveyQuestionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_textController != null && oldWidget.currentAnswer != widget.currentAnswer) {
      _textController!.text = widget.currentAnswer?.toString() ?? '';
    }
  }

  @override
  void dispose() {
    _textController?.removeListener(_onTextChanged);
    _textController?.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    if (_textController != null) {
      widget.onAnswerChanged(_textController!.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth > 600 ? 32.0 : 16.0;

    return Container(
      margin: EdgeInsets.symmetric(horizontal: horizontalPadding, vertical: 12),
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
                TextSpan(text: widget.question.question),
                if (widget.question.isRequired)
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
    switch (widget.question.type) {
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
    }
  }

  Widget _buildMultipleChoice(BuildContext context) {
    final theme = Theme.of(context);
    final options = widget.question.options ?? [];

    return Column(
      children: options.asMap().entries.map((entry) {
        final index = entry.key;
        final option = entry.value;
        final isSelected = widget.currentAnswer == option;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => widget.onAnswerChanged(option),
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

    // Defensive validation for maxValue
    int maxValue = 5; // default
    if (widget.question.maxValue != null) {
      try {
        maxValue = (widget.question.maxValue as num).toInt();
        maxValue = maxValue.clamp(1, 10); // enforce reasonable bounds
      } catch (e) {
        maxValue = 5; // fallback if casting fails
      }
    }

    // Defensive validation for currentRating
    int currentRating = 0;
    if (widget.currentAnswer != null) {
      try {
        currentRating = (widget.currentAnswer as num).toInt();
      } catch (e) {
        currentRating = 0; // fallback if casting fails
      }
    }
    currentRating = currentRating.clamp(0, maxValue);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: List.generate(maxValue, (index) {
            final rating = index + 1;
            final isSelected = rating <= currentRating;

            return GestureDetector(
              onTap: () => widget.onAnswerChanged(rating),
              child: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Icon(
                  isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
                  color: isSelected
                      ? const Color(0xFFFFC107)
                      : theme.dividerColor,
                  size: 40,
                ),
              ),
            );
          }),
        ),
        if (currentRating > 0) ...[
          const SizedBox(height: 8),
          Text(
            '$currentRating out of $maxValue',
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildScale(BuildContext context) {
    final theme = Theme.of(context);
    final minValue = (widget.question.minValue ?? 1).toDouble();
    final maxValue = (widget.question.maxValue ?? 10).toDouble();
    final currentValue = (widget.currentAnswer as double?) ?? minValue;

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
            onChanged: (value) => widget.onAnswerChanged(value),
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
    final currentBool = widget.currentAnswer as bool?;

    return Row(
      children: [
        Expanded(
          child: _buildYesNoOption(
            context: context,
            label: 'Yes',
            value: true,
            isSelected: currentBool == true,
            onTap: () => widget.onAnswerChanged(true),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildYesNoOption(
            context: context,
            label: 'No',
            value: false,
            isSelected: currentBool == false,
            onTap: () => widget.onAnswerChanged(false),
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
      controller: _textController,
      maxLines: widget.question.type == QuestionType.text ? 4 : 1,
      style: theme.textTheme.bodyMedium?.copyWith(fontSize: 16),
      decoration: InputDecoration(
        hintText: widget.question.placeholder ?? 'Enter your answer...',
        hintStyle: theme.textTheme.bodyMedium?.copyWith(
          color: isDarkMode ? Colors.grey[400] : const Color(0xFF667085),
          fontSize: 14,
        ),
        filled: true,
        fillColor: isDarkMode ? Colors.transparent : Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isDarkMode ? Colors.grey[700]! : const Color(0xFFD0D5DD),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.primaryColor,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: isDarkMode ? Colors.grey[700]! : const Color(0xFFD0D5DD),
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 14,
          vertical: 10,
        ),
      ),
    );
  }
}