import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

class LearnVideoActivity extends StatefulWidget {
  final LearnVideoPayload payload;
  final VoidCallback onContinue;

  const LearnVideoActivity({
    super.key,
    required this.payload,
    required this.onContinue,
  });

  @override
  State<LearnVideoActivity> createState() => _LearnVideoActivityState();
}

class _LearnVideoActivityState extends State<LearnVideoActivity> {
  VideoPlayerController? _directController;
  YoutubePlayerController? _youtubeController;
  bool _ready = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    final url = widget.payload.videoUrl;
    final youtubeId = _extractYoutubeId(url);
    try {
      if (youtubeId != null) {
        _youtubeController = YoutubePlayerController.fromVideoId(
          videoId: youtubeId,
          autoPlay: false,
          params: const YoutubePlayerParams(
            showFullscreenButton: true,
            mute: false,
          ),
        );
      } else if (_isDirectVideo(url)) {
        _directController = VideoPlayerController.networkUrl(Uri.parse(url));
        await _directController!.initialize();
        _directController!.setLooping(true);
      } else {
        _error = 'Unsupported video URL';
      }
    } catch (e) {
      _error = 'Could not load video';
    }
    if (mounted) setState(() => _ready = true);
  }

  @override
  void dispose() {
    _directController?.dispose();
    _youtubeController?.close();
    super.dispose();
  }

  Future<void> _openExternal() async {
    final uri = Uri.tryParse(widget.payload.videoUrl);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

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
                  AspectRatio(
                    aspectRatio: 16 / 9,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: _buildPlayer(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TranslatedText(
                    widget.payload.description,
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
          LearnExperienceBottomBar(
            primaryLabel: 'Continue',
            onPrimary: widget.onContinue,
          ),
        ],
      ),
    );
  }

  Widget _buildPlayer() {
    if (!_ready) {
      return Container(
        color: const Color(0xFFC8D8F8),
        alignment: Alignment.center,
        child: const CircularProgressIndicator(strokeWidth: 2),
      );
    }

    if (_error != null) {
      return Container(
        color: const Color(0xFFC8D8F8),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.play_circle_outline, size: 48),
            const SizedBox(height: 8),
            TranslatedText(_error!),
            TextButton(
              onPressed: _openExternal,
              child: const TranslatedText('Open in browser'),
            ),
          ],
        ),
      );
    }

    if (_youtubeController != null) {
      return YoutubePlayer(controller: _youtubeController!);
    }

    if (_directController != null && _directController!.value.isInitialized) {
      return Stack(
        alignment: Alignment.center,
        children: [
          VideoPlayer(_directController!),
          if (!_directController!.value.isPlaying)
            IconButton(
              iconSize: 56,
              color: Colors.white,
              onPressed: () => setState(() {
                _directController!.play();
              }),
              icon: const Icon(Icons.play_circle_fill),
            ),
        ],
      );
    }

    return Container(color: const Color(0xFFC8D8F8));
  }

  static String? _extractYoutubeId(String url) {
    final uri = Uri.tryParse(url);
    if (uri == null) return null;
    if (uri.host.contains('youtu.be')) {
      return uri.pathSegments.isNotEmpty ? uri.pathSegments.first : null;
    }
    if (uri.host.contains('youtube.com')) {
      return uri.queryParameters['v'];
    }
    return null;
  }

  static bool _isDirectVideo(String url) {
    final lower = url.toLowerCase();
    return lower.endsWith('.mp4') ||
        lower.endsWith('.mov') ||
        lower.contains('commondatastorage.googleapis.com');
  }
}
