import 'dart:io';
import 'dart:ui' as ui;

import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_confetti.dart';
import 'package:airqo/src/app/learn/widgets/learn_sheet_button_styles.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class LearnCourseCertificatePane extends StatefulWidget {
  final LearnCourseViewModel course;
  final LearnStageInfo stage;
  final VoidCallback onDone;

  const LearnCourseCertificatePane({
    super.key,
    required this.course,
    required this.stage,
    required this.onDone,
  });

  @override
  State<LearnCourseCertificatePane> createState() =>
      _LearnCourseCertificatePaneState();
}

class _LearnCourseCertificatePaneState extends State<LearnCourseCertificatePane> {
  final _certificateKey = GlobalKey();
  bool _sharing = false;

  Future<void> _shareCertificate() async {
    setState(() => _sharing = true);
    try {
      final boundary = _certificateKey.currentContext?.findRenderObject()
          as RenderRepaintBoundary?;
      if (boundary == null) return;
      final image = await boundary.toImage(pixelRatio: 3);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final pngBytes = byteData.buffer.asUint8List();

      final dir = await getTemporaryDirectory();
      final file = File(
        '${dir.path}/airqo_course_${widget.course.id}_certificate.png',
      );
      await file.writeAsBytes(pngBytes);

      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'I completed ${widget.course.plainTitleKey} on AirQo Learn!',
      );
    } finally {
      if (mounted) setState(() => _sharing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Column(
                  children: [
                    TranslatedText(
                      'Course complete!',
                      style: LearnDesignTokens.lessonTitle(context),
                    ),
                    const SizedBox(height: 6),
                    TranslatedText(
                      widget.stage.name,
                      style: LearnDesignTokens.activitySubtitle(context),
                    ),
                    const SizedBox(height: 20),
                    RepaintBoundary(
                      key: _certificateKey,
                      child: _CertificateCard(
                        courseTitle: widget.course.plainTitleKey,
                        stageName: widget.stage.name,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  children: [
                    ElevatedButton(
                      onPressed: _sharing ? null : _shareCertificate,
                      style: learnExposurePrimaryButtonStyle(
                        enabled: !_sharing,
                      ),
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
                ),
              ),
            ),
          ],
        ),
        const LearnLessonConfetti(),
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
