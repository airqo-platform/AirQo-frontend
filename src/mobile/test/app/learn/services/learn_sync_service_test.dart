import 'dart:convert';

import 'package:airqo/src/app/learn/services/learn_api_client.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/services/learn_sync_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const baseUrl = 'https://api.test';

  late SharedPreferences prefs;
  late LearnProgressService progress;
  late List<http.Request> requests;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    prefs = await SharedPreferences.getInstance();
    progress = LearnProgressService.withPrefs(prefs);
    requests = [];
  });

  LearnSyncServiceImpl buildService({
    required http.Response Function(http.Request) handler,
    String? authToken,
  }) {
    return LearnSyncServiceImpl(
      api: LearnApiClient(
        baseUrl: baseUrl,
        client: MockClient((request) async {
          requests.add(request);
          return handler(request);
        }),
      ),
      progress: progress,
      authTokenProvider: () async => authToken,
      deviceIdProvider: () async => 'device-123',
      prefsProvider: () async => prefs,
      appVersionProvider: () async => '1.0.0',
    );
  }

  group('ensureGuestSession', () {
    test('stores the guest id and skips the API once one exists', () async {
      final service = buildService(
        handler: (_) => http.Response(
            json.encode({'success': true, 'guest_id': 'g_1'}), 201),
      );

      await service.ensureGuestSession();
      expect(prefs.getString('learn_guest_id'), 'g_1');
      expect(requests, hasLength(1));

      await service.ensureGuestSession();
      expect(requests, hasLength(1), reason: 'no second session request');
    });

    test('survives a failed session request', () async {
      final service = buildService(
        handler: (_) => http.Response('down', 500),
      );

      await service.ensureGuestSession();
      expect(prefs.getString('learn_guest_id'), isNull);
    });
  });

  group('reportCompletion', () {
    test('sends JWT and guest identity with the full body', () async {
      await prefs.setString('learn_guest_id', 'g_1');
      final service = buildService(
        authToken: 'tok',
        handler: (_) =>
            http.Response(json.encode({'success': true, 'stars': 3}), 200),
      );

      await service.reportCompletion(
        'lesson-1',
        furthestActivityIndex: 4,
        quizAttempts: const [
          QuizAttemptData(
              activityId: 'a1', format: 'single_choice', isCorrect: true),
        ],
        freeTextResponse: '  my answer  ',
      );

      final request = requests.single;
      expect(request.method, 'PUT');
      expect(request.url.path,
          '/api/v2/devices/learn/progress/lessons/lesson-1');
      expect(request.headers['Authorization'], 'JWT tok');
      expect(request.headers['X-Guest-Id'], 'g_1');
      expect(request.headers['X-Device-Id'], 'device-123');
      final body = json.decode(request.body) as Map<String, dynamic>;
      expect(body['furthest_activity_index'], 4);
      expect(body['completed'], isTrue);
      expect(body['quiz_attempts'], hasLength(1));
      expect(body['free_text_response'], 'my answer');
      // Nothing buffered on success.
      expect(prefs.getString('learn_pending_sync'), isNull);
    });

    test('buffers on failure and syncPendingProgress flushes the buffer',
        () async {
      var failPut = true;
      final service = buildService(
        handler: (request) {
          if (request.method == 'PUT' && failPut) {
            return http.Response('down', 500);
          }
          return http.Response(json.encode({'success': true}), 200);
        },
      );

      await service.reportCompletion(
        'lesson-1',
        furthestActivityIndex: 4,
        freeTextResponse: 'saved offline',
      );

      final buffered =
          json.decode(prefs.getString('learn_pending_sync')!) as List;
      expect(buffered, hasLength(1));
      expect(buffered.first['lesson_id'], 'lesson-1');
      expect(buffered.first['free_text_response'], 'saved offline');

      failPut = false;
      await service.syncPendingProgress();

      final syncRequest = requests.last;
      expect(syncRequest.url.path, '/api/v2/devices/learn/progress/sync');
      final syncBody = json.decode(syncRequest.body) as Map<String, dynamic>;
      expect(syncBody['device_id'], 'device-123');
      expect(syncBody['updates'], hasLength(1));
      expect(prefs.getString('learn_pending_sync'), isNull,
          reason: 'buffer cleared after a successful flush');
    });
  });

  group('hydrateLocalProgress', () {
    test('merges server lessons into the local store', () async {
      final service = buildService(
        handler: (_) => http.Response(
          json.encode({
            'success': true,
            'total_points': 30,
            'lessons': {
              'lesson-1': {
                'completed': true,
                'furthest_activity_index': 3,
                'stars': 3,
                'points_earned': 30,
                'quiz_score_ratio': 1,
                'free_text_response': 'server copy',
              },
            },
          }),
          200,
        ),
      );

      final before = progress.revision.value;
      await service.hydrateLocalProgress();

      expect(progress.isLessonComplete('lesson-1'), isTrue);
      // Server index 3 → local step count 4.
      expect(progress.furthestStep('lesson-1'), 4);
      expect(progress.lessonStars('lesson-1'), 3);
      expect(progress.lessonPoints('lesson-1'), 30);
      expect(progress.lessonQuizScore('lesson-1'), 1.0);
      expect(progress.lessonFreeText('lesson-1'), 'server copy');
      expect(progress.revision.value, greaterThan(before),
          reason: 'listeners notified after a merge');
    });
  });

  group('linkProgressToAccount', () {
    test('links, flushes pending progress, and clears the guest id',
        () async {
      await prefs.setString('learn_guest_id', 'g_1');
      final service = buildService(
        handler: (_) => http.Response(json.encode({'success': true}), 200),
      );

      await service.linkProgressToAccount('tok');

      final linkRequest = requests.single;
      expect(linkRequest.url.path, '/api/v2/devices/learn/progress/link');
      expect(linkRequest.headers['Authorization'], 'JWT tok');
      expect(json.decode(linkRequest.body),
          {'device_id': 'device-123', 'guest_id': 'g_1'});
      expect(prefs.getString('learn_guest_id'), isNull);
    });

    test('keeps the guest id when linking fails', () async {
      await prefs.setString('learn_guest_id', 'g_1');
      final service = buildService(
        handler: (_) => http.Response('bad', 400),
      );

      await service.linkProgressToAccount('tok');
      expect(prefs.getString('learn_guest_id'), 'g_1');
    });
  });
}
