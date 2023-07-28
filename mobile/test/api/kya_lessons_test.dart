import 'dart:convert';

import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'kya_lessons_test.mocks.dart';

@GenerateMocks([http.Client])
Future<void> main() async {
  late MockClient client;
  late Map<String, String> headers;
  Map<String, dynamic> mockedResponse = {
    "success": true,
    "message": "successfully retrieved the lessons",
    "kya_lessons": [
      {
        "_id": "64ae5d0",
        "title": "Actions you can take to reduce air pollution",
        "completion_message":
            "You just finished your first Know Your Air Lesson",
        "image":
            "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fwalk-or-cycle.jpg?alt=media&token=30d",
        "tasks": [
          {
            "_id": "64ae5d37fd84",
            "title": "Become a champion for clear air",
            "content":
                "Join our air quality campaign and advocate for clean air in your community",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fbe-a-champion.jpg?alt=media&token=62",
            "createdAt": "2023-07-12T07:58:48.007Z",
            "updatedAt": "2023-07-12T08:24:28.896Z",
            "__v": 0,
            "kya_lesson": "64ae5d06f",
            "task_position": 1
          },
          {
            "_id": "64ae5d5dfd843e",
            "title": "Use public transport",
            "content":
                "Vehicle exhaust is a major source of air pollution. Less cars on the road results in less emissions.",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fpublic-transport.jpg?alt=media&token=932d0",
            "createdAt": "2023-07-12T07:59:25.912Z",
            "updatedAt": "2023-07-12T08:24:47.771Z",
            "__v": 0,
            "kya_lesson": "64ae5",
            "task_position": 2
          },
          {
            "_id": "64ae5d6",
            "title": "Service your car/boda boda regularly",
            "content":
                "Regular inspections can maximise fuel efficiency, which reduces vehicle emissions.",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fservice-your-car.jpg?alt=media&token=5e195",
            "createdAt": "2023-07-12T07:59:41.042Z",
            "updatedAt": "2023-07-12T08:25:08.679Z",
            "__v": 0,
            "kya_lesson": "64ae5d06",
            "task_position": 3
          },
          {
            "_id": "64ae5d7",
            "title": "Avoid idling your car engine in traffic",
            "content":
                "Vehicles produce particularly unhealthy exhaust. Switch off your engine while in traffic",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Favoid-idling-in-traffic.jpg?alt=media&token=e4a",
            "createdAt": "2023-07-12T07:59:57.072Z",
            "updatedAt": "2023-07-12T08:25:21.444Z",
            "__v": 0,
            "kya_lesson": "64ae5d0",
            "task_position": 4
          },
          {
            "_id": "64ae5d8bf",
            "title": "Walk or cycle",
            "content":
                "Walk or cycle to lower your individual carbon footprint while improving  your health too!",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fwalk-or-cycle.jpg?alt=media&token=30d7",
            "createdAt": "2023-07-12T08:00:11.426Z",
            "updatedAt": "2023-07-12T08:25:34.079Z",
            "__v": 0,
            "kya_lesson": "64ae5d06fd8",
            "task_position": 5
          },
          {
            "_id": "64ae5d99",
            "title": "Avoid burning garbage",
            "content":
                "Burning your household garbage is dangerous to your health and our environment",
            "image":
                "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/app-illustrations%2Fdo-not-burn-rubbish.jpg?alt=media&token=bde1",
            "createdAt": "2023-07-12T08:00:25.544Z",
            "updatedAt": "2023-07-12T08:25:46.419Z",
            "__v": 0,
            "kya_lesson": "64ae",
            "task_position": 6
          }
        ],
        "active_task": 2,
        "status": "IN_PROGRESS"
      }
    ]
  };

  group('KyaLessons', () {
    setUpAll(() async {
      await dotenv.load(fileName: Config.environmentFile);
      headers = {
        'Authorization': 'JWT ${Config.airqoJWTToken}',
        'service': ApiService.deviceRegistry.serviceName,
      };
      client = MockClient();
    });

    test('successfully get mocked user lessons', () async {
      when(
        client.get(
          Uri.parse(
              '${AirQoUrls.kya}/lessons?tenant=airqo&TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
        ),
      ).thenAnswer(
        (_) async => http.Response(
          jsonEncode(mockedResponse),
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      List<KyaLesson> lessons = await airqoApiClient.fetchKyaLessons("");

      expect(lessons, isA<List<KyaLesson>>());
      expect(lessons.isNotEmpty, true);
      for (KyaLesson lesson in lessons) {
        expect(lesson.activeTask, 1);
        expect(lesson.status, KyaLessonStatus.todo);
        expect(lesson.tasks.isNotEmpty, true);
      }
    });
  });
}
