import 'package:airqo/src/app/dashboard/widgets/share_sheet_widgets.dart';
import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_completion_sheet.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:loggy/loggy.dart';
import 'package:share_plus/share_plus.dart';

class LearnCourseCertificatePane extends StatefulWidget {
  final LearnCourseViewModel course;
  final LearnStageInfo stage;
  final VoidCallback onDone;
  final DateTime completedAt;

  LearnCourseCertificatePane({
    super.key,
    required this.course,
    required this.stage,
    required this.onDone,
    DateTime? completedAt,
  }) : completedAt = completedAt ?? DateTime.now();

  @override
  State<LearnCourseCertificatePane> createState() =>
      _LearnCourseCertificatePaneState();
}

class _LearnCourseCertificatePaneState extends State<LearnCourseCertificatePane>
    with UiLoggy {
  static const _appDownloadUrl = 'https://airqo.net/explore-data';

  final _certificateKey = GlobalKey();
  bool _sharing = false;
  String? _shareError;

  String get _shareMessage =>
      'I completed ${learnDisplayTitle(widget.course.plainTitleKey)} course on AirQo Learn! '
      'Download the AirQo app and complete the course yourself: $_appDownloadUrl';

  Future<void> _shareCertificate() async {
    if (_sharing) return;
    setState(() {
      _sharing = true;
      _shareError = null;
    });
    try {
      final pngBytes = await captureShareBoundary(context, _certificateKey);
      if (pngBytes == null || !mounted) {
        if (mounted) {
          setState(
            () => _shareError = "Couldn't prepare the certificate. Try again.",
          );
        }
        return;
      }

      // iPadOS requires an anchor rect for its share popover; share_plus
      // throws without one.
      final box = context.findRenderObject() as RenderBox?;
      final sharePositionOrigin =
          box != null ? box.localToGlobal(Offset.zero) & box.size : null;

      await Share.shareXFiles(
        [
          XFile.fromData(
            pngBytes,
            mimeType: 'image/png',
            name: 'airqo_course_${widget.course.id}_certificate.png',
          ),
        ],
        text: _shareMessage,
        sharePositionOrigin: sharePositionOrigin,
      );
    } catch (error) {
      loggy.error('Failed to share course certificate: $error');
      if (mounted) {
        setState(
          () => _shareError = "Couldn't share the certificate. Try again.",
        );
      }
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return LearnCompletionSheet.body(
      context: context,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: LearnDesignTokens.successBg(context),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              LearnDesignTokens.completedCheckIcon,
              size: 28,
              color: LearnDesignTokens.success,
            ),
          ),
          const SizedBox(height: 14),
          TranslatedText(
            'Course complete!',
            style: LearnDesignTokens.completionTitle(context),
          ),
          const SizedBox(height: 4),
          TranslatedText(
            learnDisplayTitle(widget.course.plainTitleKey),
            textAlign: TextAlign.center,
            style: LearnDesignTokens.completionSubtitle(context),
          ),
          const SizedBox(height: 16),
          RepaintBoundary(
            key: _certificateKey,
            child: _CertificateCard(
              courseTitle: widget.course.plainTitleKey,
              stageName: widget.stage.name,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            learnCourseCompletionTime(widget.completedAt),
            textAlign: TextAlign.center,
            style: LearnDesignTokens.completionCaption(context),
          ),
          if (_shareError != null) ...[
            const SizedBox(height: 8),
            TranslatedText(
              _shareError!,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.error,
              ),
            ),
          ],
        ],
      ),
      actions: [
        ElevatedButton(
          onPressed: _sharing ? null : _shareCertificate,
          style: learnExposurePrimaryButtonStyle(enabled: !_sharing),
          child: TranslatedText(
            _sharing ? 'Preparing...' : 'Share certificate',
          ),
        ),
        const SizedBox(height: 8),
        OutlinedButton(
          onPressed: widget.onDone,
          style: learnExposureSecondaryButtonStyle(context),
          child: const TranslatedText('Done'),
        ),
      ],
    );
  }
}

class _CertificateCard extends StatelessWidget {
  final String courseTitle;
  final String stageName;

  const _CertificateCard({
    required this.courseTitle,
    required this.stageName,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: const Color(0xFFFEFCF3),
        border: Border.all(color: const Color(0xFFC8B87A), width: 2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFDDD0A0)),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Column(
          children: [
            const Text(
              'AIRQO',
              style: TextStyle(
                fontSize: 12,
                letterSpacing: 2,
                fontWeight: FontWeight.w700,
                color: Color(0xFF8A7340),
              ),
            ),
            Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              height: 1,
              width: 32,
              color: const Color(0xFFC8B87A),
            ),
            const Text(
              'CERTIFICATE OF COMPLETION',
              style: TextStyle(
                fontSize: 9,
                letterSpacing: 0.5,
                color: Color(0xFFA08C50),
              ),
            ),
            const SizedBox(height: 16),
            TranslatedText(
              courseTitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2E2F33),
              ),
            ),
            const SizedBox(height: 10),
            TranslatedText(
              stageName,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF7A7F87),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
