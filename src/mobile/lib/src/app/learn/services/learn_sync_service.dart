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

class LearnSyncService extends BaseRepository with UiLoggy {
  static final LearnSyncService instance = LearnSyncService._();
  LearnSyncService._();

  static const _guestIdKey = 'learn_guest_id';
  static const _pendingSyncKey = 'learn_pending_sync';

  SharedPreferences? _prefs;

  Future<void> _ensurePrefs() async {
    _prefs ??= await SharedPreferences.getInstance();
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
        final guestId = body['guest_id'] as String? ??
            body['session_id'] as String?;
        if (guestId != null) {
          await _prefs!.setString(_guestIdKey, guestId);
          loggy.info('Guest Learn session created: $guestId');
        }
      }
    } catch (e) {
      loggy.warning('Failed to create guest Learn session: $e');
    }
  }

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
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnProgress}/$lessonId'),
        body: json.encode(body),
        headers: headers,
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        loggy.info('Reported completion for lesson $lessonId');
      } else {
        loggy.warning(
            'Progress report failed (${response.statusCode}), buffering');
        await _bufferPending(lessonId, body);
      }
    } catch (e) {
      loggy.warning('Progress report error: $e — buffering');
      await _bufferPending(lessonId, body);
    }
  }

  Future<void> syncPendingProgress() async {
    await _ensurePrefs();
    final raw = _prefs!.getString(_pendingSyncKey);
    if (raw == null) return;

    try {
      final pending = json.decode(raw) as List;
      if (pending.isEmpty) return;

      final headers = await _guestHeaders();
      final response = await http.post(
        Uri.parse('${ApiUtils.baseUrl}${ApiUtils.learnProgressSync}'),
        body: json.encode({'progress': pending}),
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        await _prefs!.remove(_pendingSyncKey);
        loggy.info('Synced ${pending.length} pending Learn progress entries');
      }
    } catch (e) {
      loggy.warning('Pending Learn progress sync failed: $e');
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
        await _prefs!.remove(_guestIdKey);
        loggy.info('Guest Learn progress linked to account');
      }
    } catch (e) {
      loggy.warning('Failed to link guest Learn progress: $e');
    }
  }

  Future<void> _bufferPending(
      String lessonId, Map<String, dynamic> body) async {
    try {
      final raw = _prefs!.getString(_pendingSyncKey);
      final pending =
          raw != null ? json.decode(raw) as List : <dynamic>[];
      pending.add({'lesson_id': lessonId, ...body});
      await _prefs!.setString(_pendingSyncKey, json.encode(pending));
    } catch (e) {
      loggy.error('Failed to buffer pending Learn progress: $e');
    }
  }
}
