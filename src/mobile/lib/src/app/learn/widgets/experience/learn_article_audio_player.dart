import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

/// AirQo-style listen control for article TTS with theme-aware tray colors.
class LearnArticleAudioPlayer extends StatelessWidget {
  final bool isPlaying;
  final Duration elapsed;
  final Duration total;
  final VoidCallback onToggle;

  const LearnArticleAudioPlayer({
    super.key,
    required this.isPlaying,
    required this.elapsed,
    required this.total,
    required this.onToggle,
  });

  static int estimateDurationSeconds(String text, {double speechRate = 0.45}) {
    final words =
        text.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
    if (words == 0) return 0;
    final wpm = 150 * speechRate;
    return ((words / wpm) * 60).ceil().clamp(3, 900);
  }

  static String formatDuration(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final trayBg = LearnDesignTokens.nestedSurface(context);
    final textColor = LearnDesignTokens.muted(context);
    final trackColor = LearnDesignTokens.divider(context);
    final isDark = LearnDesignTokens.isDark(context);
    final progress = total.inSeconds > 0
        ? (elapsed.inSeconds / total.inSeconds).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: trayBg,
        borderRadius: BorderRadius.circular(12),
        border: isDark
            ? null
            : Border.all(color: LearnDesignTokens.divider(context)),
      ),
      child: Row(
        children: [
          Material(
            color: AppColors.primaryColor,
            shape: const CircleBorder(),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: onToggle,
              customBorder: const CircleBorder(),
              child: SizedBox(
                width: 40,
                height: 40,
                child: Icon(
                  isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            formatDuration(elapsed),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textColor,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: isPlaying || progress > 0 ? progress : null,
                minHeight: 4,
                backgroundColor: trackColor,
                color: AppColors.primaryColor,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            formatDuration(total),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textColor,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}
