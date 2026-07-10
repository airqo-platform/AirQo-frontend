import 'dart:convert';

import 'package:airqo/src/app/learn/services/learn_api_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('LearnApiClient', () {
    const baseUrl = 'https://api.test';
    const identity = LearnCallerIdentity(deviceId: 'device-123');

    LearnApiClient clientReturning(
      http.Response response, {
      List<http.Request>? requests,
    }) {
      return LearnApiClient(
        baseUrl: baseUrl,
        client: MockClient((request) async {
          requests?.add(request);
          return response;
        }),
      );
    }

    group('createAnonymousSession', () {
      test('posts device payload and returns guest_id', () async {
        final requests = <http.Request>[];
        final client = clientReturning(
          http.Response(json.encode({'success': true, 'guest_id': 'g_1'}), 201),
          requests: requests,
        );

        final guestId = await client.createAnonymousSession(
          identity: identity,
          platform: 'android',
          appVersion: '1.2.3',
        );

        expect(guestId, 'g_1');
        final request = requests.single;
        expect(request.url.path, '/api/v2/devices/learn/sessions/anonymous');
        expect(request.headers['X-Device-Id'], 'device-123');
        final body = json.decode(request.body) as Map<String, dynamic>;
        expect(body['device_id'], 'device-123');
        expect(body['platform'], 'android');
        expect(body['app_version'], '1.2.3');
      });

      test('falls back to session_id and returns null on failure', () async {
        final fallback = clientReturning(
          http.Response(json.encode({'session_id': 's_9'}), 200),
        );
        expect(
          await fallback.createAnonymousSession(
            identity: identity,
            platform: 'ios',
            appVersion: '1.0.0',
          ),
          's_9',
        );

        final failing = clientReturning(http.Response('oops', 500));
        expect(
          await failing.createAnonymousSession(
            identity: identity,
            platform: 'ios',
            appVersion: '1.0.0',
          ),
          isNull,
        );
      });
    });

    group('headers', () {
      test('include guest id and JWT when the identity carries them',
          () async {
        final requests = <http.Request>[];
        final client = clientReturning(
          http.Response(json.encode({'success': true}), 200),
          requests: requests,
        );

        await client.putLessonProgress(
          identity: const LearnCallerIdentity(
            deviceId: 'device-123',
            guestId: 'g_1',
            authToken: 'tok',
          ),
          lessonId: 'lesson-1',
          body: const {'completed': true},
        );

        final headers = requests.single.headers;
        expect(headers['X-Device-Id'], 'device-123');
        expect(headers['X-Guest-Id'], 'g_1');
        expect(headers['Authorization'], 'JWT tok');
      });

      test('omit guest id and JWT for a bare device identity', () async {
        final requests = <http.Request>[];
        final client = clientReturning(
          http.Response(json.encode({'success': true}), 200),
          requests: requests,
        );

        await client.getProgress(identity: identity);

        final headers = requests.single.headers;
        expect(headers.containsKey('X-Guest-Id'), isFalse);
        expect(headers.containsKey('Authorization'), isFalse);
      });
    });

    group('putLessonProgress', () {
      test('returns response body on 2xx and null otherwise', () async {
        final requests = <http.Request>[];
        final ok = clientReturning(
          http.Response(json.encode({'stars': 3}), 200),
          requests: requests,
        );
        final body = await ok.putLessonProgress(
          identity: identity,
          lessonId: 'lesson/1',
          body: const {'completed': true},
        );
        expect(json.decode(body!), {'stars': 3});
        // Lesson id is URI-encoded into the path.
        expect(requests.single.url.path,
            '/api/v2/devices/learn/progress/lessons/lesson%2F1');

        final failing = clientReturning(http.Response('nope', 404));
        expect(
          await failing.putLessonProgress(
            identity: identity,
            lessonId: 'lesson-1',
            body: const {},
          ),
          isNull,
        );
      });
    });

    group('getProgress', () {
      test('parses lessons keyed by lesson id', () async {
        final client = clientReturning(http.Response(
          json.encode({
            'success': true,
            'total_points': 40,
            'lessons': {
              'lesson-1': {
                'completed': true,
                'furthest_activity_index': 3,
                'stars': 3,
                'points_earned': 30,
                'quiz_score_ratio': 1,
                'free_text_response': 'because air matters',
              },
            },
          }),
          200,
        ));

        final progress = await client.getProgress(identity: identity);

        expect(progress!.totalPoints, 40);
        final lesson = progress.lessons['lesson-1']!;
        expect(lesson.completed, isTrue);
        expect(lesson.furthestActivityIndex, 3);
        expect(lesson.stars, 3);
        expect(lesson.pointsEarned, 30);
        expect(lesson.quizScoreRatio, 1.0);
        expect(lesson.freeTextResponse, 'because air matters');
      });

      test('returns null on non-2xx', () async {
        final client = clientReturning(http.Response('bad', 400));
        expect(await client.getProgress(identity: identity), isNull);
      });
    });

    group('linkGuestProgress / postSyncUpdates', () {
      test('report success from the status code', () async {
        final requests = <http.Request>[];
        final ok = clientReturning(
          http.Response(json.encode({'success': true}), 200),
          requests: requests,
        );

        expect(
          await ok.linkGuestProgress(
            identity: const LearnCallerIdentity(
                deviceId: 'device-123', authToken: 'tok'),
            guestId: 'g_1',
          ),
          isTrue,
        );
        final linkBody = json.decode(requests.single.body);
        expect(linkBody, {'device_id': 'device-123', 'guest_id': 'g_1'});

        expect(
          await ok.postSyncUpdates(
            identity: identity,
            updates: const [
              {'lesson_id': 'lesson-1', 'completed': true},
            ],
          ),
          isTrue,
        );

        final failing = clientReturning(http.Response('bad', 400));
        expect(
          await failing.linkGuestProgress(identity: identity, guestId: 'g_1'),
          isFalse,
        );
        expect(
          await failing.postSyncUpdates(identity: identity, updates: const []),
          isFalse,
        );
      });
    });
  });
}
