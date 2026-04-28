import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/surveys/models/alert_response_model.dart';

class AlertResponseDialog extends StatefulWidget {
  final bool followedAdvice;
  final Function(AlertResponse) onResponseSubmitted;
  final String alertId;
  final String userId;
  final Map<String, dynamic>? alertContext;

  const AlertResponseDialog({
    super.key,
    required this.followedAdvice,
    required this.onResponseSubmitted,
    required this.alertId,
    required this.userId,
    this.alertContext,
  });

  @override
  State<AlertResponseDialog> createState() => _AlertResponseDialogState();
}

class _AlertResponseDialogState extends State<AlertResponseDialog> {
  FollowedReason? _selectedFollowedReason;
  NotFollowedReason? _selectedNotFollowedReason;
  final TextEditingController _customReasonController = TextEditingController();
  bool _showCustomInput = false;

  @override
  void dispose() {
    _customReasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;

    return AlertDialog(
      backgroundColor: theme.highlightColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.all(20),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: widget.followedAdvice
                      ? Colors.green.withValues(alpha: 0.1)
                      : Colors.orange.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  widget.followedAdvice ? Icons.check_circle : Icons.info,
                  color: widget.followedAdvice ? Colors.green : Colors.orange,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.followedAdvice
                      ? 'Great! What did you do?'
                      : 'What prevented you?',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                    color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            widget.followedAdvice
                ? 'Help us understand which actions people take:'
                : 'Help us understand common barriers:',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontSize: 14,
              color: isDarkMode
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
            ),
          ),
          const SizedBox(height: 16),
          
          // Reason options
          if (widget.followedAdvice)
            ...FollowedReason.values.map((reason) => _buildReasonTile(
                  reason.displayText,
                  _selectedFollowedReason == reason,
                  () => setState(() {
                    _selectedFollowedReason = reason;
                    _showCustomInput = reason == FollowedReason.other;
                  }),
                ))
          else
            ...NotFollowedReason.values.map((reason) => _buildReasonTile(
                  reason.displayText,
                  _selectedNotFollowedReason == reason,
                  () => setState(() {
                    _selectedNotFollowedReason = reason;
                    _showCustomInput = reason == NotFollowedReason.other;
                  }),
                )),

          if (_showCustomInput) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _customReasonController,
              decoration: InputDecoration(
                hintText: 'Please specify...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: isDarkMode
                        ? AppColors.dividerColordark
                        : AppColors.dividerColorlight,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              style: TextStyle(
                fontSize: 14,
                color: isDarkMode ? Colors.white : AppColors.boldHeadlineColor4,
              ),
            ),
          ],

          const SizedBox(height: 20),
          
          // Action buttons
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: TextButton.styleFrom(
                    foregroundColor: isDarkMode
                        ? AppColors.secondaryHeadlineColor2
                        : AppColors.secondaryHeadlineColor,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: _canSubmit() ? _submitResponse : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Submit',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReasonTile(String text, bool isSelected, VoidCallback onTap) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primaryColor.withValues(alpha: 0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected
                  ? AppColors.primaryColor
                  : (isDarkMode
                      ? AppColors.dividerColordark
                      : AppColors.dividerColorlight),
              width: isSelected ? 1.5 : 0.5,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                color: isSelected
                    ? AppColors.primaryColor
                    : AppColors.secondaryHeadlineColor,
                size: 18,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                    color: isSelected
                        ? (isDarkMode ? Colors.white : AppColors.boldHeadlineColor4)
                        : (isDarkMode
                            ? AppColors.secondaryHeadlineColor2
                            : AppColors.secondaryHeadlineColor),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool _canSubmit() {
    if (widget.followedAdvice) {
      if (_selectedFollowedReason == null) return false;
      if (_selectedFollowedReason == FollowedReason.other) {
        return _customReasonController.text.trim().isNotEmpty;
      }
      return true;
    } else {
      if (_selectedNotFollowedReason == null) return false;
      if (_selectedNotFollowedReason == NotFollowedReason.other) {
        return _customReasonController.text.trim().isNotEmpty;
      }
      return true;
    }
  }

  void _submitResponse() {
    final response = AlertResponse(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      alertId: widget.alertId,
      userId: widget.userId,
      responseType: widget.followedAdvice
          ? AlertResponseType.followed
          : AlertResponseType.notFollowed,
      followedReason: _selectedFollowedReason,
      notFollowedReason: _selectedNotFollowedReason,
      customReason: _showCustomInput ? _customReasonController.text.trim() : null,
      respondedAt: DateTime.now(),
      alertContext: widget.alertContext,
    );

    widget.onResponseSubmitted(response);
    Navigator.of(context).pop();
  }
}