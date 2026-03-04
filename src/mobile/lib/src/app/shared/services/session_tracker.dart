import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:loggy/loggy.dart';
import 'package:uuid/uuid.dart';

/// Tracks user sessions: start time, duration, and user identity.
///
/// A session begins when the app comes to the foreground and ends
/// when it is backgrounded or terminated. Each session gets a unique
/// ID so daily session counts and durations can be queried in PostHog.
class SessionTracker with UiLoggy {
  static final SessionTracker _instance = SessionTracker._internal();
  factory SessionTracker() => _instance;
  SessionTracker._internal();

  static const _uuid = Uuid();

  String? _sessionId;
  DateTime? _sessionStart;
  String? _userId;
  bool _isGuest = false;

  /// Call when the app is foregrounded (or first launched).
  Future<void> startSession() async {
    // End any lingering session first (e.g. quick background/foreground)
    if (_sessionId != null) {
      await endSession();
    }

    _sessionId = _uuid.v4();
    _sessionStart = DateTime.now();
    _userId = await AuthHelper.getCurrentUserId(suppressGuestWarning: true);
    _isGuest = _userId == null;

    loggy.info('Session started: $_sessionId (guest: $_isGuest)');

    await AnalyticsService().trackSessionStarted(
      sessionId: _sessionId!,
      userId: _userId,
      isGuest: _isGuest,
    );
  }

  /// Call when the app is backgrounded or terminated.
  Future<void> endSession() async {
    if (_sessionId == null || _sessionStart == null) return;

    final duration = DateTime.now().difference(_sessionStart!);

    loggy.info(
      'Session ended: $_sessionId — ${duration.inSeconds}s',
    );

    await AnalyticsService().trackSessionEnded(
      sessionId: _sessionId!,
      durationSeconds: duration.inSeconds,
      userId: _userId,
      isGuest: _isGuest,
    );

    _sessionId = null;
    _sessionStart = null;
    _userId = null;
    _isGuest = false;
  }
}
