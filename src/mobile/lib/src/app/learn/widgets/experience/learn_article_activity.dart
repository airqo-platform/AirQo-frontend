import 'dart:async';

import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_article_audio_player.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

class LearnArticleActivity extends StatefulWidget {
  final LearnArticlePayload payload;
  final String activityTypeLabel;
  final VoidCallback onContinue;

  const LearnArticleActivity({
    super.key,
    required this.payload,
    required this.activityTypeLabel,
    required this.onContinue,
  });

  @override
  State<LearnArticleActivity> createState() => _LearnArticleActivityState();
}

class _LearnArticleActivityState extends State<LearnArticleActivity> {
  static const _speechRate = 0.45;

  final _scrollController = ScrollController();
  final _tts = FlutterTts();
  Timer? _progressTimer;
  bool _canContinue = false;
  bool _isListening = false;
  Duration _elapsed = Duration.zero;
  late Duration _totalDuration;
  late String _spokenText;
  int _highlightStart = -1;
  int _highlightEnd = -1;

  @override
  void initState() {
    super.initState();
    _spokenText = widget.payload.audioText ?? widget.payload.body;
    _totalDuration = Duration(
      seconds: LearnArticleAudioPlayer.estimateDurationSeconds(
        _spokenText,
        speechRate: _speechRate,
      ),
    );
    _scrollController.addListener(_checkScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkScroll());
    _initTts();
  }

  Future<void> _initTts() async {
    await _tts.setSpeechRate(_speechRate);
    await _tts.setVolume(1);
    await _tts.setPitch(1);
    _tts.setCompletionHandler(() => _onPlaybackEnded(completed: true));
    _tts.setCancelHandler(() => _onPlaybackEnded(completed: false));
    _tts.setProgressHandler((text, start, end, word) {
      if (!mounted) return;
      setState(() {
        _highlightStart = start;
        _highlightEnd = end;
      });
    });
  }

  void _onPlaybackEnded({required bool completed}) {
    _progressTimer?.cancel();
    if (!mounted) return;
    setState(() {
      _isListening = false;
      // A user stop restarts from the beginning next time, so the bar
      // resets; only natural completion shows a full bar.
      _elapsed = completed ? _totalDuration : Duration.zero;
      _highlightStart = -1;
      _highlightEnd = -1;
    });
  }

  void _startProgressTimer() {
    _progressTimer?.cancel();
    _progressTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || !_isListening) return;
      setState(() {
        if (_elapsed < _totalDuration) {
          _elapsed += const Duration(seconds: 1);
        }
      });
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
      _progressTimer?.cancel();
      if (!mounted) return;
      setState(() {
        _isListening = false;
        _elapsed = Duration.zero;
        _highlightStart = -1;
        _highlightEnd = -1;
      });
      return;
    }
    setState(() {
      _isListening = true;
      _elapsed = Duration.zero;
      _highlightStart = -1;
      _highlightEnd = -1;
    });
    _startProgressTimer();
    await _tts.speak(_spokenText);
  }

  TextStyle _bodyStyle(BuildContext context) {
    return TextStyle(
      fontSize: 14,
      height: 1.55,
      color: LearnDesignTokens.headline(context),
    );
  }

  /// Highlighting swaps the rendered text for [_spokenText], so it is only
  /// safe when the spoken text is the article body itself — otherwise the
  /// visible article would change while listening.
  bool get _canHighlight =>
      widget.payload.audioText == null ||
      widget.payload.audioText == widget.payload.body;

  Widget _buildArticleBody(BuildContext context) {
    final baseStyle = _bodyStyle(context);
    if (!_canHighlight ||
        !_isListening ||
        _highlightStart < 0 ||
        _highlightEnd <= _highlightStart) {
      return TranslatedText(
        widget.payload.body,
        style: baseStyle,
      );
    }

    final text = _spokenText;
    final safeStart = _highlightStart.clamp(0, text.length);
    final safeEnd = _highlightEnd.clamp(safeStart, text.length);

    return Text.rich(
      TextSpan(
        style: baseStyle,
        children: [
          if (safeStart > 0) TextSpan(text: text.substring(0, safeStart)),
          TextSpan(
            text: text.substring(safeStart, safeEnd),
            style: baseStyle.copyWith(
              backgroundColor: AppColors.primaryColor.withValues(alpha: 0.28),
              color: AppColors.primaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (safeEnd < text.length) TextSpan(text: text.substring(safeEnd)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _progressTimer?.cancel();
    _tts.stop();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LearnActivityCardShell(
      activityTypeLabel: widget.activityTypeLabel,
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: _buildArticleBody(context),
            ),
          ),
          LearnArticleAudioPlayer(
            isPlaying: _isListening,
            elapsed: _elapsed,
            total: _totalDuration,
            onToggle: _toggleListen,
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
