import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:airqo/src/app/auth/services/auth_helper.dart';
import 'package:airqo/src/app/learn/models/learn_progress_models.dart';
import 'package:airqo/src/app/learn/services/learn_api_client.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/shared/services/cache_manager.dart';
import 'package:airqo/src/app/shared/utils/device_id_manager.dart';
import 'package:loggy/loggy.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

export 'package:airqo/src/app/learn/models/learn_progress_models.dart';

// ---------------------------------------------------------------------------
// Private: offline progress buffer — append / drain / clear SharedPrefs list.
// ---------------------------------------------------------------------------

class _ProgressBuffer with UiLoggy {
  static const _key = 'learn_pending_sync';
  final SharedPreferences _prefs;

  _ProgressBuffer(this._prefs);

  Future<void> append(String lessonId, Map<String, dynamic> body) async {
    try {
      final raw = _prefs.getString(_key);
      final pending = raw != null ? json.decode(raw) as List : <dynamic>[];
      pending.add({'lesson_id': lessonId, ...body});
      await _prefs.setString(_key, json.encode(pending));
    } catch (e) {
      loggy.error('Failed to buffer pending Learn progress: $e');
    }
  }

  List<dynamic>? drain() {
    final raw = _prefs.getString(_key);
    if (raw == null) return null;
    try {
      return json.decode(raw) as List;
    } catch (e) {
      loggy.warning('Corrupt Learn progress buffer, clearing: $e');
      _prefs.remove(_key);
      return null;
    }
  }

  Future<void> clear() => _prefs.remove(_key);
}

// ---------------------------------------------------------------------------
// Public interface — callers depend on this, not on the impl.
// ---------------------------------------------------------------------------

abstract class LearnSyncService {
  /// App-wide instance. Deliberately settable so tests (or a future DI
  /// container) can substitute an implementation before widgets read it.
  static LearnSyncService instance = LearnSyncServiceImpl();

  Future<void> ensureGuestSession();
  Future<void> linkProgressToAccount(String authToken);
  Future<void> reportCompletion(
    String lessonId, {
    required int furthestActivityIndex,
    List<QuizAttemptData> quizAttempts,
    String? freeTextResponse,
  });
  Future<void> syncPendingProgress();
  Future<LearnServerProgress?> fetchProgress({String? authToken});
  Future<void> hydrateLocalProgress({String? authToken});
}

/// Orchestrates Learn progress sync: guest-session lifecycle, buffering of
/// failed reports, offline flush, and server→local hydration. Transport
/// lives in [LearnApiClient]; local persistence in [LearnProgressService].
class LearnSyncServiceImpl with UiLoggy implements LearnSyncService {
  LearnSyncServiceImpl({
    LearnApiClient? api,
    LearnProgressService? progress,
    CacheManager? cacheManager,
    Future<String?> Function()? authTokenProvider,
    Future<String> Function()? deviceIdProvider,
    Future<SharedPreferences> Function()? prefsProvider,
    Future<String> Function()? appVersionProvider,
  })  : _api = api ?? LearnApiClient(),
        _progress = progress ?? LearnProgressService.instance,
        _cacheManager = cacheManager ?? CacheManager(),
        _authTokenProvider = authTokenProvider ?? _defaultAuthToken,
        _deviceIdProvider = deviceIdProvider ?? DeviceIdManager.getDeviceId,
        _prefsProvider = prefsProvider ?? SharedPreferences.getInstance,
        _appVersionProvider = appVersionProvider ?? _defaultAppVersion;

  static const _guestIdKey = 'learn_guest_id';

  final LearnApiClient _api;
  final LearnProgressService _progress;
  final CacheManager _cacheManager;
  final Future<String?> Function() _authTokenProvider;
  final Future<String> Function() _deviceIdProvider;
  final Future<SharedPreferences> Function() _prefsProvider;
  final Future<String> Function() _appVersionProvider;

  SharedPreferences? _prefs;
  _ProgressBuffer? _buffer;
  StreamSubscription<ConnectionType>? _connectivitySub;

  static Future<String?> _defaultAuthToken() async {
    try {
      return await AuthHelper.refreshTokenIfNeeded();
    } catch (_) {
      return null;
    }
  }

  static Future<String> _defaultAppVersion() async {
    try {
      return (await PackageInfo.fromPlatform()).version;
    } catch (_) {
      return 'unknown';
    }
  }

  /// Flushes buffered progress as soon as connectivity returns instead of
  /// waiting for the next app launch. Lives for the app's lifetime (the
  /// service is a singleton), so the subscription is never cancelled.
  void _ensureReconnectFlush() {
    _connectivitySub ??= _cacheManager.connectionChange.listen((type) {
      if (type != ConnectionType.none) {
        syncPendingProgress().catchError((_) {});
      }
    });
  }

  Future<void> _ensurePrefs() async {
    if (_prefs != null) return;
    _prefs = await _prefsProvider();
    _buffer = _ProgressBuffer(_prefs!);
  }

  /// Identity for progress calls: device + guest headers plus, when the user
  /// is logged in, the JWT — the server resolves the JWT identity first, so
  /// logged-in progress is attributed to the account unambiguously.
  Future<LearnCallerIdentity> _identity({String? authToken}) async {
    return LearnCallerIdentity(
      deviceId: await _deviceIdProvider(),
      guestId: _prefs?.getString(_guestIdKey),
      authToken: authToken ?? await _authTokenProvider(),
    );
  }

  // ---- Guest session management ------------------------------------------

  @override
  Future<void> ensureGuestSession() async {
    await _ensurePrefs();
    _ensureReconnectFlush();
    if (_prefs!.getString(_guestIdKey) != null) return;

    try {
      final guestId = await _api.createAnonymousSession(
        identity: LearnCallerIdentity(deviceId: await _deviceIdProvider()),
        platform: Platform.isIOS ? 'ios' : 'android',
        appVersion: await _appVersionProvider(),
      );
      if (guestId != null) {
        await _prefs!.setString(_guestIdKey, guestId);
        loggy.info('Guest Learn session created');
      }
    } catch (e) {
      loggy.warning('Failed to create guest Learn session: $e');
    }
  }

  @override
  Future<void> linkProgressToAccount(String authToken) async {
    await _ensurePrefs();
    final guestId = _prefs!.getString(_guestIdKey);
    if (guestId == null) return;

    try {
      final linked = await _api.linkGuestProgress(
        identity: LearnCallerIdentity(
          deviceId: await _deviceIdProvider(),
          authToken: authToken,
        ),
        guestId: guestId,
      );
      if (linked) {
        await syncPendingProgress();
        await _prefs!.remove(_guestIdKey);
        loggy.info('Guest Learn progress linked to account');
      }
    } catch (e) {
      loggy.warning('Failed to link guest Learn progress: $e');
    }
  }

  // ---- Progress reporting -------------------------------------------------

  @override
  Future<void> reportCompletion(
    String lessonId, {
    required int furthestActivityIndex,
    List<QuizAttemptData> quizAttempts = const [],
    String? freeTextResponse,
  }) async {
    await _ensurePrefs();

    final freeText = freeTextResponse?.trim();
    final body = <String, dynamic>{
      'furthest_activity_index': furthestActivityIndex,
      'completed': true,
      if (quizAttempts.isNotEmpty)
        'quiz_attempts': quizAttempts.map((q) => q.toJson()).toList(),
      if (freeText != null && freeText.isNotEmpty)
        'free_text_response': freeText,
    };

    try {
      final responseBody = await _api.putLessonProgress(
        identity: await _identity(),
        lessonId: lessonId,
        body: body,
      );
      if (responseBody != null) {
        _logServerProgress(lessonId, responseBody);
      } else {
        loggy.warning('Progress report failed, buffering');
        await _buffer!.append(lessonId, body);
      }
    } catch (e) {
      loggy.warning('Progress report error: $e — buffering');
      await _buffer!.append(lessonId, body);
    }
  }

  // ---- Progress restore ---------------------------------------------------

  @override
  Future<LearnServerProgress?> fetchProgress({String? authToken}) async {
    await _ensurePrefs();
    try {
      final progress = await _api.getProgress(
        identity: await _identity(authToken: authToken),
      );
      if (progress != null) {
        loggy.info('Fetched Learn progress: ${progress.lessons.length} '
            'lesson(s), ${progress.totalPoints} total pts');
      }
      return progress;
    } catch (e) {
      loggy.warning('Learn progress fetch error: $e');
      return null;
    }
  }

  /// Fetches server-side progress and merges it into local storage,
  /// keeping the best of each lesson (never downgrades local progress).
  @override
  Future<void> hydrateLocalProgress({String? authToken}) async {
    final server = await fetchProgress(authToken: authToken);
    if (server == null || server.lessons.isEmpty) return;

    await _progress.ensureInitialized();
    var merged = 0;
    for (final entry in server.lessons.entries) {
      final lesson = entry.value;
      final changed = await _progress.mergeServerLesson(
        lessonKey: entry.key,
        completed: lesson.completed,
        // Server stores the furthest activity *index*; local furthest step
        // is a count of completed steps.
        furthestStep: lesson.furthestActivityIndex != null
            ? lesson.furthestActivityIndex! + 1
            : null,
        stars: lesson.stars,
        points: lesson.pointsEarned,
        quizScoreRatio: lesson.quizScoreRatio,
        freeTextResponse: lesson.freeTextResponse,
      );
      if (changed) merged++;
    }
    if (merged > 0) _progress.notifyChanged();
    loggy.info('Hydrated Learn progress from server: '
        '$merged of ${server.lessons.length} lesson(s) updated locally');
  }

  void _logServerProgress(String lessonId, String responseBody) {
    try {
      final data = json.decode(responseBody) as Map<String, dynamic>;
      final stage = data['current_stage'];
      loggy.info('Reported completion for lesson $lessonId — server says '
          '${data['stars']} star(s), ${data['points_earned']} pts earned, '
          '${data['total_points']} total pts'
          '${stage is Map ? ', stage ${stage['name']}' : ''}');
    } catch (_) {
      loggy.info('Reported completion for lesson $lessonId');
    }
  }

  // ---- Offline sync -------------------------------------------------------

  @override
  Future<void> syncPendingProgress() async {
    await _ensurePrefs();
    final pending = _buffer!.drain();
    if (pending == null || pending.isEmpty) return;

    try {
      final synced = await _api.postSyncUpdates(
        identity: await _identity(),
        updates: pending,
      );
      if (synced) {
        await _buffer!.clear();
        loggy.info('Synced ${pending.length} pending Learn progress entries');
      }
    } catch (e) {
      loggy.warning('Pending Learn progress sync failed: $e');
    }
  }
}
