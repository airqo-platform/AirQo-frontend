import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_image.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnImageActivity extends StatelessWidget {
  final LearnImagePayload payload;
  final VoidCallback onContinue;

  const LearnImageActivity({
    super.key,
    required this.payload,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    return LearnActivityCardShell(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (payload.imageUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LearnLessonImage(
                        url: payload.imageUrl,
                        height: 180,
                      ),
                    )
                  else
                    Container(
                      height: 180,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFC8D8F8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.image_outlined, size: 48),
                    ),
                  const SizedBox(height: 12),
                  TranslatedText(
                    payload.caption,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: LearnDesignTokens.headline(context),
                    ),
                  ),
                  if (payload.subtitle != null) ...[
                    const SizedBox(height: 8),
                    TranslatedText(
                      payload.subtitle!,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.5,
                        color: LearnDesignTokens.muted(context),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          LearnExperienceBottomBar(onPrimary: onContinue),
        ],
      ),
    );
  }
}
