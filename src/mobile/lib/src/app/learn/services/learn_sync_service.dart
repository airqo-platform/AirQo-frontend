import 'dart:convert';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/app/shared/utils/device_id_manager.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';
import 'package:shared_preferences/shared_preferences.dart';

class QuizAttemptData {
  final String activityId;
  final String format;
  final int? selectedIndex;
  final bool isCorrect;

  const QuizAttemptData({
    required this.activityId,
    required this.format,
    this.selectedIndex,
    required this.isCorrect,
  });

  Map<String, dynamic> toJson() => {
        'activity_id': activityId,
        'format': format,
        if (selectedIndex != null) 'selected_index': selectedIndex,
        'is_correct': isCorrect,
      };
}

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
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() => _prefs.remove(_key);
}

// ---------------------------------------------------------------------------
// Public service — three distinct concerns composed here.
// ---------------------------------------------------------------------------

class LearnSyncService extends BaseRepository with UiLoggy {
  static final LearnSyncService instance = LearnSyncService._();
  LearnSyncService._();

  static const _guestIdKey = 'learn_guest_id';

  SharedPreferences? _prefs;
  _ProgressBuffer? _buffer;

  Future<void> _ensurePrefs() async {
    if (_prefs != null) return;
    _prefs = await SharedPreferences.getInstance();
    _buffer = _ProgressBuffer(_prefs!);
  }

  Future<Map<String, String>> _guestHeaders() async {
    final deviceId = await DeviceIdManager.getDeviceId();
    final guestId = _prefs?.getString(_guestIdKey);
    return {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'X-Device-Id': deviceId,
      if (guestId != null) 'X-Guest-Id': guestId,
      'User-Agent': ApiUtils.mobileUserAgent,
    };
  }

  // ---- Guest session management ------------------------------------------

  Future<void> ensureGuestSession() async {
    await _ensurePrefs();
    if (_prefs!.getString(_guestIdKey) != null) return;

    try {
      final deviceId = await DeviceIdManager.getDeviceId();
      final response = await http.post(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnSessions}'),
        body: json.encode({'device_id': deviceId, 'platform': 'mobile'}),
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'X-Device-Id': deviceId,
          'User-Agent': ApiUtils.mobileUserAgent,
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final body = json.decode(response.body) as Map<String, dynamic>;
        final guestId =
            body['guest_id'] as String? ?? body['session_id'] as String?;
        if (guestId != null) {
          await _prefs!.setString(_guestIdKey, guestId);
          loggy.info('Guest Learn session created');
        }
      }
    } catch (e) {
      loggy.warning('Failed to create guest Learn session: $e');
    }
  }

  Future<void> linkProgressToAccount(String authToken) async {
    await _ensurePrefs();
    final guestId = _prefs!.getString(_guestIdKey);
    if (guestId == null) return;

    try {
      final deviceId = await DeviceIdManager.getDeviceId();
      final response = await http.post(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnProgressLink}'),
        body: json.encode({'guest_id': guestId}),
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': 'JWT $authToken',
          'X-Device-Id': deviceId,
          'User-Agent': ApiUtils.mobileUserAgent,
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        await syncPendingProgress();
        await _prefs!.remove(_guestIdKey);
        loggy.info('Guest Learn progress linked to account');
      }
    } catch (e) {
      loggy.warning('Failed to link guest Learn progress: $e');
    }
  }

  // ---- Progress reporting -------------------------------------------------

  Future<void> reportCompletion(
    String lessonId, {
    required int totalActivities,
    List<QuizAttemptData> quizAttempts = const [],
    String? freeTextResponse,
  }) async {
    await _ensurePrefs();

    final body = <String, dynamic>{
      'total_activities': totalActivities,
      'completed': true,
      if (quizAttempts.isNotEmpty)
        'quiz_attempts': quizAttempts.map((q) => q.toJson()).toList(),
      if (freeTextResponse != null && freeTextResponse.isNotEmpty)
        'free_text_response': freeTextResponse,
    };

    try {
      final headers = await _guestHeaders();
      final response = await http.put(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnProgress}/${Uri.encodeComponent(lessonId)}'),
        body: json.encode(body),
        headers: headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        loggy.info('Reported completion for lesson $lessonId');
      } else {
        loggy.warning(
            'Progress report failed (${response.statusCode}), buffering');
        await _buffer!.append(lessonId, body);
      }
    } catch (e) {
      loggy.warning('Progress report error: $e — buffering');
      await _buffer!.append(lessonId, body);
    }
  }

  // ---- Offline sync -------------------------------------------------------

  Future<void> syncPendingProgress() async {
    await _ensurePrefs();
    final pending = _buffer!.drain();
    if (pending == null || pending.isEmpty) return;

    try {
      final headers = await _guestHeaders();
      final response = await http.post(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnProgressSync}'),
        body: json.encode({'progress': pending}),
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        await _buffer!.clear();
        loggy.info('Synced ${pending.length} pending Learn progress entries');
      }
    } catch (e) {
      loggy.warning('Pending Learn progress sync failed: $e');
    }
  }
}
