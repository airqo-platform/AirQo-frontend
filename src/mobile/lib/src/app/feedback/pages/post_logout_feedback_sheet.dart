import 'package:airqo/src/app/feedback/repository/feedback_repository.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';

class PostLogoutFeedbackSheet extends StatefulWidget {
  final String? userEmail;

  const PostLogoutFeedbackSheet({super.key, this.userEmail});

  static Future<void> show(BuildContext context, {String? userEmail}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PostLogoutFeedbackSheet(userEmail: userEmail),
    );
  }

  @override
  State<PostLogoutFeedbackSheet> createState() =>
      _PostLogoutFeedbackSheetState();
}

class _PostLogoutFeedbackSheetState extends State<PostLogoutFeedbackSheet>
    with UiLoggy {
  int? _selectedRating;
  bool _isSubmitting = false;

  Future<void> _submit() async {
    if (_selectedRating == null) return;
    setState(() => _isSubmitting = true);
    try {
      await FeedbackRepository().submitFeedback(
        email: widget.userEmail ?? '',
        subject: 'Session Rating',
        message: 'User rated their session experience: $_selectedRating/5 stars',
        rating: _selectedRating,
        category: 'general',
      );
    } catch (e) {
      loggy.warning('Post-logout feedback submission failed: $e');
    } finally {
      if (mounted) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final headlineColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor5;
    final skipColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final starIdleColor =
        isDark ? AppColors.boldHeadlineColor3 : Colors.grey[400]!;
    final disabledBg =
        isDark ? const Color(0xFF3A3A3C) : Colors.grey[300]!;

    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        16,
        24,
        MediaQuery.of(context).viewInsets.bottom + 32,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.boldHeadlineColor.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'How would you rate your experience?',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: headlineColor,
            ),
          ),
          const SizedBox(height: 28),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              final star = index + 1;
              final selected =
                  _selectedRating != null && star <= _selectedRating!;
              return GestureDetector(
                onTap: () => setState(() => _selectedRating = star),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    selected
                        ? Icons.star_rounded
                        : Icons.star_outline_rounded,
                    size: 44,
                    color: selected ? AppColors.primaryColor : starIdleColor,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed:
                      _isSubmitting ? null : () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    'Skip',
                    style: TextStyle(
                      color: skipColor,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _selectedRating != null && !_isSubmitting
                      ? _submit
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: disabledBg,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Submit',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
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
}
