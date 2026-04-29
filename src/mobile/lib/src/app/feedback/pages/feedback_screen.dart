import 'package:airqo/src/app/feedback/repository/feedback_repository.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';
import 'package:package_info_plus/package_info_plus.dart';

class FeedbackScreen extends StatefulWidget {
  /// Pre-filled email (pass current user's email when authenticated).
  final String? initialEmail;

  const FeedbackScreen({super.key, this.initialEmail});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> with UiLoggy {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _subjectController = TextEditingController();
  final _messageController = TextEditingController();

  int? _selectedRating;
  String _selectedCategory = 'general';
  bool _isSubmitting = false;

  static const List<Map<String, String>> _categories = [
    {'value': 'general', 'label': 'General'},
    {'value': 'bug', 'label': 'Bug Report'},
    {'value': 'feature_request', 'label': 'Feature Request'},
    {'value': 'performance', 'label': 'Performance'},
    {'value': 'ux_design', 'label': 'UX / Design'},
    {'value': 'other', 'label': 'Other'},
  ];

  @override
  void initState() {
    super.initState();
    if (widget.initialEmail != null) {
      _emailController.text = widget.initialEmail!;
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final metadata = <String, dynamic>{
        'appVersion': '${packageInfo.version}(${packageInfo.buildNumber})',
      };

      await FeedbackRepository().submitFeedback(
        email: _emailController.text.trim(),
        subject: _subjectController.text.trim(),
        message: _messageController.text.trim(),
        rating: _selectedRating,
        category: _selectedCategory,
        metadata: metadata,
      );

      if (!mounted) return;
      _showSuccess();
    } catch (e) {
      loggy.error('Feedback submission error: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send feedback. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSuccess() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor:
              isDark ? AppColors.darkThemeBackground : Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: TranslatedText(
            'Thank you!',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: isDark ? Colors.white : AppColors.boldHeadlineColor,
            ),
          ),
          content: TranslatedText(
            'Your feedback has been received. We appreciate you helping us improve AirQo.',
            style: TextStyle(
              color: isDark
                  ? AppColors.secondaryHeadlineColor2
                  : AppColors.secondaryHeadlineColor,
            ),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop();
              },
              child: TranslatedText('Done'),
            ),
          ],
          actionsPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        isDark ? Colors.white : AppColors.boldHeadlineColor4;
    final subtitleColor =
        isDark ? Colors.grey[400]! : AppColors.secondaryHeadlineColor;
    final bgColor =
        isDark ? AppColors.darkThemeBackground : AppColors.backgroundColor;
    final borderColor =
        isDark ? Colors.grey[800]! : AppColors.borderColor2;
    final fillColor = isDark ? const Color(0xFF404040) : Colors.white;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: TranslatedText(
          'Send Feedback',
          style: TextStyle(
            color: textColor,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: AbsorbPointer(
        absorbing: _isSubmitting,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TranslatedText(
                  'We value your input. Share your thoughts to help us improve AirQo.',
                  style: TextStyle(color: subtitleColor, fontSize: 14),
                ),
                const SizedBox(height: 24),

                // Email
                _buildLabel('Email address', textColor),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _emailController,
                  hint: 'your@email.com',
                  keyboardType: TextInputType.emailAddress,
                  fillColor: fillColor,
                  borderColor: borderColor,
                  textColor: textColor,
                  hintColor: subtitleColor,
                  isDark: isDark,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Email is required';
                    }
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v.trim())) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Subject
                _buildLabel('Subject', textColor),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _subjectController,
                  hint: 'Brief description of your feedback',
                  fillColor: fillColor,
                  borderColor: borderColor,
                  textColor: textColor,
                  hintColor: subtitleColor,
                  isDark: isDark,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Subject is required';
                    }
                    if (v.trim().length > 200) {
                      return 'Subject must be 200 characters or less';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Category
                _buildLabel('Category', textColor),
                const SizedBox(height: 12),
                _buildCategoryChips(isDark),
                const SizedBox(height: 20),

                // Message
                _buildLabel('Message', textColor),
                const SizedBox(height: 8),
                _buildTextField(
                  controller: _messageController,
                  hint: 'Describe your feedback in detail...',
                  maxLines: 5,
                  fillColor: fillColor,
                  borderColor: borderColor,
                  textColor: textColor,
                  hintColor: subtitleColor,
                  isDark: isDark,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Message is required';
                    }
                    if (v.trim().length > 5000) {
                      return 'Message must be 5000 characters or less';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Star rating
                _buildLabel('Rating (optional)', textColor),
                const SizedBox(height: 8),
                _buildStarRating(isDark),
                const SizedBox(height: 32),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : TranslatedText(
                            'Submit Feedback',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, Color color) {
    return TranslatedText(
      text,
      style: TextStyle(
        color: color,
        fontWeight: FontWeight.w500,
        fontSize: 14,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required Color fillColor,
    required Color borderColor,
    required Color textColor,
    required Color hintColor,
    required bool isDark,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: TextStyle(
        color: isDark ? Colors.white : AppColors.boldHeadlineColor4,
        fontSize: 16,
      ),
      cursorColor: AppColors.primaryColor,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: hintColor.withValues(alpha: 0.6)),
        filled: true,
        fillColor: fillColor,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: borderColor, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide:
              BorderSide(color: AppColors.primaryColor, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: validator,
    );
  }

  Widget _buildCategoryChips(bool isDark) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _categories.map((cat) {
        final selected = _selectedCategory == cat['value'];
        return GestureDetector(
          onTap: () => setState(() => _selectedCategory = cat['value']!),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: selected
                  ? AppColors.primaryColor
                  : (isDark ? AppColors.darkThemeBackground : const Color(0xFFF4F6F8)),
              borderRadius: BorderRadius.circular(8),
              border: selected
                  ? null
                  : Border.all(
                      color: isDark
                          ? const Color(0xFF3A3A3C)
                          : const Color(0xFFE2E3E5),
                      width: 1,
                    ),
            ),
            child: Text(
              cat['label']!,
              style: TextStyle(
                fontSize: 14,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: selected
                    ? Colors.white
                    : (isDark
                        ? AppColors.boldHeadlineColor2
                        : const Color(0xFF1A1D23)),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStarRating(bool isDark) {
    return Row(
      children: List.generate(5, (index) {
        final starIndex = index + 1;
        final isSelected =
            _selectedRating != null && starIndex <= _selectedRating!;
        return GestureDetector(
          onTap: () {
            setState(() {
              // Tap the same star again to deselect
              _selectedRating =
                  _selectedRating == starIndex ? null : starIndex;
            });
          },
          child: Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Icon(
              isSelected ? Icons.star : Icons.star_border,
              color: isSelected
                  ? Colors.amber
                  : (isDark ? Colors.grey[600] : Colors.grey[400]),
              size: 36,
            ),
          ),
        );
      }),
    );
  }
}
