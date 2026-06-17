import 'package:airqo/src/app/learn/widgets/learn_lesson_image.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnStepDualButtons extends StatelessWidget {
  final String primaryLabel;
  final VoidCallback? onPrimary;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;
  final bool primaryEnabled;

  const LearnStepDualButtons({
    super.key,
    this.primaryLabel = 'Continue',
    this.onPrimary,
    this.secondaryLabel,
    this.onSecondary,
    this.primaryEnabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: primaryEnabled ? onPrimary : null,
          style: learnExposurePrimaryButtonStyle(enabled: primaryEnabled),
          child: TranslatedText(primaryLabel),
        ),
        if (secondaryLabel != null) ...[
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: onSecondary,
            style: learnExposureSecondaryButtonStyle(context),
            child: TranslatedText(secondaryLabel!),
          ),
        ],
      ],
    );
  }
}

class LearnNotesActivityCard extends StatefulWidget {
  final String title;
  final String body;
  final VoidCallback onContinue;

  const LearnNotesActivityCard({
    super.key,
    required this.title,
    required this.body,
    required this.onContinue,
  });

  @override
  State<LearnNotesActivityCard> createState() => _LearnNotesActivityCardState();
}

class _LearnNotesActivityCardState extends State<LearnNotesActivityCard> {
  final _controller = ScrollController();
  bool _canContinue = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_checkScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkScroll());
  }

  void _checkScroll() {
    if (!_controller.hasClients) return;
    final atEnd = _controller.position.pixels >=
        _controller.position.maxScrollExtent - 24;
    if (atEnd != _canContinue) setState(() => _canContinue = atEnd);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _LearnStepShell(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _controller,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText(
                    widget.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: LearnDesignTokens.headline(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TranslatedText(
                    widget.body,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: LearnDesignTokens.muted(context),
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: LearnStepDualButtons(
              primaryEnabled: _canContinue,
              onPrimary: widget.onContinue,
            ),
          ),
        ],
      ),
    );
  }
}

class LearnImageActivityCard extends StatelessWidget {
  final String title;
  final String body;
  final String imageUrl;
  final VoidCallback onContinue;

  const LearnImageActivityCard({
    super.key,
    required this.title,
    required this.body,
    required this.imageUrl,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return _LearnStepShell(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LearnLessonImage(url: imageUrl, height: 180),
                  ),
                  const SizedBox(height: 12),
                  TranslatedText(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: LearnDesignTokens.headline(context),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TranslatedText(
                    body,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: LearnDesignTokens.muted(context),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: LearnStepDualButtons(onPrimary: onContinue),
          ),
        ],
      ),
    );
  }
}

class _LearnStepShell extends StatelessWidget {
  final Widget child;

  const _LearnStepShell({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: LearnDesignTokens.cardBg(context),
        borderRadius: BorderRadius.circular(LearnDesignTokens.activityCardRadius),
        border: Border.all(color: LearnDesignTokens.divider(context)),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}
