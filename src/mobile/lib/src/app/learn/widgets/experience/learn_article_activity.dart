import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

class LearnArticleActivity extends StatefulWidget {
  final LearnArticlePayload payload;
  final VoidCallback onContinue;

  const LearnArticleActivity({
    super.key,
    required this.payload,
    required this.onContinue,
  });

  @override
  State<LearnArticleActivity> createState() => _LearnArticleActivityState();
}

class _LearnArticleActivityState extends State<LearnArticleActivity> {
  final _scrollController = ScrollController();
  final _tts = FlutterTts();
  bool _canContinue = false;
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_checkScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkScroll());
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1);
    await _tts.setPitch(1);
    _tts.setCompletionHandler(() {
      if (mounted) setState(() => _isListening = false);
    });
  }

  void _checkScroll() {
    if (!_scrollController.hasClients) return;
    final atEnd = _scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 24;
    if (atEnd != _canContinue) setState(() => _canContinue = atEnd);
  }

  Future<void> _toggleListen() async {
    if (_isListening) {
      await _tts.stop();
      setState(() => _isListening = false);
      return;
    }
    final text = widget.payload.audioText ?? widget.payload.body;
    setState(() => _isListening = true);
    await _tts.speak(text);
  }

  @override
  void dispose() {
    _tts.stop();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LearnActivityCardShell(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            child: Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: _toggleListen,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primaryColor,
                  textStyle: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                icon: Icon(
                  _isListening ? Icons.stop_circle_outlined : Icons.volume_up,
                  size: 18,
                ),
                label: TranslatedText(_isListening ? 'Stop' : 'Listen'),
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: TranslatedText(
                widget.payload.body,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.55,
                  color: LearnDesignTokens.headline(context),
                ),
              ),
            ),
          ),
          LearnExperienceBottomBar(
            primaryEnabled: _canContinue,
            onPrimary: widget.onContinue,
          ),
        ],
      ),
    );
  }
}
