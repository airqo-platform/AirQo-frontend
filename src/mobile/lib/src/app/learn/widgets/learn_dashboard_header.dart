import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnDashboardHeader extends StatelessWidget {
  const LearnDashboardHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        LearnDesignTokens.horizontalPadding,
        8,
        LearnDesignTokens.horizontalPadding,
        4,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TranslatedText(
            'Learn',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: LearnDesignTokens.headline(context),
            ),
          ),
          const SizedBox(height: 4),
          TranslatedText(
            'Practical courses on air quality, health risks, and steps you can take to breathe safer.',
            style: LearnDesignTokens.sectionSubtitle(context),
          ),
        ],
      ),
    );
  }
}
