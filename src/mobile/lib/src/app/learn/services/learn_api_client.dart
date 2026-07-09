import 'dart:convert';

import 'package:airqo/src/app/learn/models/learn_progress_models.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:http/http.dart' as http;
import 'package:loggy/loggy.dart';

/// The identity a Learn progress call is made under. The server resolves the
/// JWT identity first when present, else the device/guest headers.
class LearnCallerIdentity {
  final String deviceId;
  final String? guestId;
  final String? authToken;

  const LearnCallerIdentity({
    required this.deviceId,
    this.guestId,
    this.authToken,
  });
}

/// Transport for the Learn progress endpoints — request/response shape only,
/// no flow decisions (buffering, retries, merging live in LearnSyncService).
class LearnApiClient with UiLoggy {
  LearnApiClient({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? ApiUtils.baseUrl;

  final http.Client _client;
  final String _baseUrl;

  Uri _uri(String path) => Uri.parse('$_baseUrl$path');

  Map<String, String> _headers(LearnCallerIdentity identity) => {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Device-Id': identity.deviceId,
        if (identity.guestId != null) 'X-Guest-Id': identity.guestId!,
        if (identity.authToken != null)
          'Authorization': 'JWT ${identity.authToken}',
        'User-Agent': ApiUtils.mobileUserAgent,
      };

  /// POST /sessions/anonymous. Returns the guest id, or null on a non-2xx
  /// response. Network errors propagate to the caller.
  Future<String?> createAnonymousSession({
    required LearnCallerIdentity identity,
    required String platform,
    required String appVersion,
  }) async {
    final response = await _client
        .post(
          _uri(ApiUtils.learnSessions),
          body: json.encode({
            'device_id': identity.deviceId,
            'platform': platform,
            'app_version': appVersion,
          }),
          headers: _headers(identity),
        )
        .timeout(const Duration(seconds: 10));

    if (response.statusCode < 200 || response.statusCode >= 300) return null;
    final body = json.decode(response.body) as Map<String, dynamic>;
    return body['guest_id'] as String? ?? body['session_id'] as String?;
  }

  /// POST /progress/link. Returns true on a 2xx response.
  Future<bool> linkGuestProgress({
    required LearnCallerIdentity identity,
    required String guestId,
  }) async {
    final response = await _client
        .post(
          _uri(ApiUtils.learnProgressLink),
          body: json.encode({
            'device_id': identity.deviceId,
            'guest_id': guestId,
          }),
          headers: _headers(identity),
        )
        .timeout(const Duration(seconds: 10));
    return response.statusCode >= 200 && response.statusCode < 300;
  }

  /// PUT /progress/lessons/:lesson_id. Returns the raw response body on a
  /// 2xx response, or null otherwise (caller decides whether to buffer).
  Future<String?> putLessonProgress({
    required LearnCallerIdentity identity,
    required String lessonId,
    required Map<String, dynamic> body,
  }) async {
    final response = await _client
        .put(
          _uri('${ApiUtils.learnProgress}/${Uri.encodeComponent(lessonId)}'),
          body: json.encode(body),
          headers: _headers(identity),
        )
        .timeout(const Duration(seconds: 10));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      loggy.warning('Lesson progress PUT failed (${response.statusCode})');
      return null;
    }
    return response.body;
  }

  /// POST /progress/sync. Returns true on a 2xx response.
  Future<bool> postSyncUpdates({
    required LearnCallerIdentity identity,
    required List<dynamic> updates,
  }) async {
    final response = await _client
        .post(
          _uri(ApiUtils.learnProgressSync),
          body: json.encode({
            'device_id': identity.deviceId,
            'updates': updates,
          }),
          headers: _headers(identity),
        )
        .timeout(const Duration(seconds: 15));
    return response.statusCode >= 200 && response.statusCode < 300;
  }

  /// GET /progress. Returns parsed progress, or null on a non-2xx response.
  Future<LearnServerProgress?> getProgress({
    required LearnCallerIdentity identity,
  }) async {
    final response = await _client
        .get(
          _uri(ApiUtils.learnProgressFetch),
          headers: _headers(identity),
        )
        .timeout(const Duration(seconds: 10));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      loggy.warning('Learn progress fetch failed (${response.statusCode})');
      return null;
    }
    return LearnServerProgress.fromJson(
      json.decode(response.body) as Map<String, dynamic>,
    );
  }
}
