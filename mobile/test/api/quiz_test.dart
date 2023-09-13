import 'dart:convert';

import 'package:app/constants/api.dart';
import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';

import 'package:mockito/mockito.dart';
import 'api.mocks.dart';
// import 'quiz_test.mocks.dart';

// import 'api.mocks.dart';

///@GenerateNiceMocks([MockSpec<Quiz>()])

@GenerateMocks([http.Client])
Future<void> main() async {
  late MockClient client;
  late Map<String, String> headers;
  Map<String, dynamic> mockedResponse = {
    "success": true,
    "message": "successfully retrieved the quizzes",
    "kya_quizzes": [
      {
        "_id": "64e722d048456f0012137aee",
        "title": "Discover your personalized air quality tips here!",
        "description":
            "Take this quiz about your surroundings and daily routine to unlock customized tips just for you!",
        "completion_message":
            "Way to go. You have unlocked personalised air quality recommendations to empower you on your clean air journey.",
        "image":
            "https://firebasestorage.googleapis.com/v0/b/airqo-250220.appspot.com/o/kya-quiz%2FquizImage.png?alt=media&token=e25845ca-f9c9-43ea-8de8-5e6bd0c8b748",
        "questions": [
          {
            "_id": "64e70c6548456f0012137664",
            "title": "What cooking method do you use at home?",
            "context": "Home environment",
            "question_position": 1,
            "createdAt": "2023-08-24T07:53:09.500Z",
            "updatedAt": "2023-09-05T06:59:31.406Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e763d99be50300138c8c69",
                "content": [
                  "Cooking with firewood can emit significant amounts of air pollutants.",
                  "Cook in a well-ventilated kitchen with good airflow or set up an outdoor kitchen if possible.",
                  "Use an efficient stove designed to burn firewood more cleanly and with less smoke.",
                  "Consider switching to improved cookstoves that reduce emissions and increase fuel efficiency."
                ],
                "title": "Firewood",
                "createdAt": "2023-08-24T14:06:17.479Z",
                "updatedAt": "2023-08-24T20:13:39.883Z",
                "__v": 0,
                "kya_question": "64e70c6548456f0012137664"
              },
              {
                "_id": "64e764005e3f3c0012a932ee",
                "content": [
                  "Using a charcoal stove for cooking can release harmful pollutants like carbon monoxide.",
                  "Use a charcoal stove in a well-ventilated kitchen or near an open window.",
                  "While cooking, keep doors and windows open to reduce smoke.",
                  "If feasible, consider transitioning to cleaner cooking options to reduce indoor air pollution."
                ],
                "title": "Charcoal Stove",
                "createdAt": "2023-08-24T14:06:56.573Z",
                "updatedAt": "2023-08-24T20:13:39.883Z",
                "__v": 0,
                "kya_question": "64e70c6548456f0012137664"
              },
              {
                "_id": "64e764139be50300138c8c6d",
                "content": [
                  "Using a gas cooker is generally a cleaner option compared to solid fuels.",
                  "Ensure proper ventilation to prevent the accumulation of gas emissions indoors.",
                  "Maintain gas cookers and connections to prevent leaks that could impact indoor air quality."
                ],
                "title": "Gas Cooker",
                "createdAt": "2023-08-24T14:07:15.517Z",
                "updatedAt": "2023-08-24T20:13:39.883Z",
                "__v": 0,
                "kya_question": "64e70c6548456f0012137664"
              },
              {
                "_id": "64e76425ee3c3e0013724956",
                "content": [
                  "Biogas is considered a cleaner cooking option.",
                  "Regularly maintain the biogas system to ensure efficient gas production and combustion.",
                  "While biogas is cleaner, ensure proper ventilation to prevent any lingering emissions.",
                  "Follow manufacturer guidelines for safe and efficient biogas use."
                ],
                "title": "Biogas",
                "createdAt": "2023-08-24T14:07:33.853Z",
                "updatedAt": "2023-08-24T20:13:39.883Z",
                "__v": 0,
                "kya_question": "64e70c6548456f0012137664"
              }
            ]
          },
          {
            "_id": "64e712159953c100130e5663",
            "title": "How do you dispose of rubbish at home?",
            "context": "Home environment",
            "question_position": 2,
            "createdAt": "2023-08-24T08:17:25.133Z",
            "updatedAt": "2023-09-05T07:00:28.409Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e7652e1fb90d0013a707fe",
                "content": [
                  "Burning rubbish can release various pollutants like particulate matter and toxic substances.",
                  "Ensure to use proper waste disposal methods like recycling, collecting at a waste disposal site or using waste collection service companies."
                ],
                "title": "Burn it",
                "createdAt": "2023-08-24T14:11:58.235Z",
                "updatedAt": "2023-08-24T20:20:40.759Z",
                "__v": 0,
                "kya_question": "64e712159953c100130e5663"
              },
              {
                "_id": "64e7bb43da61820013dfe8a2",
                "content": [
                  "Practicing proper waste collection reduces your exposure to air pollution.",
                  "Central waste disposal sites can serve as hubs for recycling and sorting facilitie"
                ],
                "title": "Collect at a waste disposal site",
                "createdAt": "2023-08-24T20:19:15.378Z",
                "updatedAt": "2023-08-24T20:20:40.759Z",
                "__v": 0,
                "kya_question": "64e712159953c100130e5663"
              },
              {
                "_id": "64f6cff5846746001a476e15",
                "content": [
                  "Composting -  Organic matter such as food scraps and yard waste are separated and buried under the soil to decay and form plant manure.",
                  "Salvaging - Materials such as metal, paper, glass, rags, and certain types of plastic can be salvaged, recycled, and reused."
                ],
                "title": "I would like to know other forms of waste management",
                "createdAt": "2023-09-05T06:51:33.827Z",
                "updatedAt": "2023-09-05T06:52:04.320Z",
                "__v": 0,
                "kya_question": "64e712159953c100130e5663"
              }
            ]
          },
          {
            "_id": "64e70c3648456f0012137660",
            "title": "Where is your home environment situated?",
            "context": "Home environment",
            "question_position": 3,
            "createdAt": "2023-08-24T07:52:22.641Z",
            "updatedAt": "2023-09-05T06:59:04.319Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e7b121da61820013dfe458",
                "content": [
                  "Living near a busy road increases exposure to air pollution.",
                  "Only open windows that face the road when traffic is light.",
                  "Plant trees/hedge around home as a barrier against emissions."
                ],
                "title": "Next to a busy road",
                "createdAt": "2023-08-24T19:36:02.002Z",
                "updatedAt": "2023-08-24T20:11:43.493Z",
                "__v": 0,
                "kya_question": "64e70c3648456f0012137660"
              },
              {
                "_id": "64e7b146da61820013dfe45c",
                "content": [
                  "Your exposure to air pollution is limited since there are less vehicle emissions."
                ],
                "title": "Street with little traffic",
                "createdAt": "2023-08-24T19:36:38.369Z",
                "updatedAt": "2023-08-24T20:11:43.493Z",
                "__v": 0,
                "kya_question": "64e70c3648456f0012137660"
              }
            ]
          },
          {
            "_id": "64e722a748456f0012137aea",
            "title": "How frequently do you participate in outdoor activities?",
            "context": "Outdoor activities",
            "question_position": 4,
            "createdAt": "2023-08-24T09:28:07.216Z",
            "updatedAt": "2023-09-05T07:02:46.705Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e7b1a1da61820013dfe461",
                "content": [
                  "Keep track of current air quality and forecasts in your location via the AirQo app to avoid outdoor activities on days with poor air quality.",
                  "Time low pollution hours like early morning or late evening.",
                  "Plan your activities around roads with less traffic and green spaces."
                ],
                "title": "Regularly",
                "createdAt": "2023-08-24T19:38:09.278Z",
                "updatedAt": "2023-08-24T20:31:34.636Z",
                "__v": 0,
                "kya_question": "64e722a748456f0012137aea"
              },
              {
                "_id": "64e7b1e9da61820013dfe465",
                "content": [
                  "Check air quality and forecasts in your location via the AirQo app to avoid outdoor activities on days with poor air quality.",
                  "Limit duration of outdoor activities on days with poor air quality."
                ],
                "title": "Occasionally",
                "createdAt": "2023-08-24T19:39:21.697Z",
                "updatedAt": "2023-08-24T20:31:34.636Z",
                "__v": 0,
                "kya_question": "64e722a748456f0012137aea"
              },
              {
                "_id": "64e7b20fda61820013dfe46a",
                "content": [
                  "For individuals who don't participate in outdoor activities, consider indoor exercise options, such as using a treadmill, stationary bike, or attending fitness classes."
                ],
                "title": "Rarely/Never",
                "createdAt": "2023-08-24T19:39:59.067Z",
                "updatedAt": "2023-08-24T20:31:34.636Z",
                "__v": 0,
                "kya_question": "64e722a748456f0012137aea"
              }
            ]
          },
          {
            "_id": "64e711ac9953c100130e565e",
            "title": "What kind of road do you frequently use?",
            "context": "Transportation",
            "question_position": 5,
            "createdAt": "2023-08-24T08:15:40.227Z",
            "updatedAt": "2023-09-05T07:00:01.853Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e7b230da61820013dfe470",
                "content": [
                  "Close windows and doors in dusty times, especially on windy days.",
                  "Wear a mask or cover your nose/mouth with a cloth like a hankie/scarf when it's dusty."
                ],
                "title": "A dusty/unpaved road",
                "createdAt": "2023-08-24T19:40:32.526Z",
                "updatedAt": "2023-08-24T20:27:09.659Z",
                "__v": 0,
                "kya_question": "64e711ac9953c100130e565e"
              },
              {
                "_id": "64e7b250da61820013dfe474",
                "content": [
                  "Living next to tarmacked roads exposes you to less dust, but vehicle emissions can still impact air quality.",
                  "Plant trees/shrubs around your home as natural barriers to absorb pollutants."
                ],
                "title": "Tarmacked road/road with less dust",
                "createdAt": "2023-08-24T19:41:04.666Z",
                "updatedAt": "2023-08-24T20:27:09.659Z",
                "__v": 0,
                "kya_question": "64e711ac9953c100130e565e"
              }
            ]
          },
          {
            "_id": "64e714d04c07320013b6ed25",
            "title": "What is your most frequently used mode of transport?",
            "context": "Transportation",
            "question_position": 6,
            "createdAt": "2023-08-24T08:29:04.922Z",
            "updatedAt": "2023-09-05T07:02:12.284Z",
            "__v": 0,
            "kya_quiz": "64e722d048456f0012137aee",
            "answers": [
              {
                "_id": "64e7b2b0da61820013dfe479",
                "content": [
                  "Regularly service your car to ensure a healthy engine which reduces emissions.",
                  "Avoid waiting for long periods with the car engine running.",
                  "When possible, carpool with others to reduce the number of cars on the road."
                ],
                "title": "A car",
                "createdAt": "2023-08-24T19:42:40.992Z",
                "updatedAt": "2023-08-24T20:28:39.058Z",
                "__v": 0,
                "kya_question": "64e714d04c07320013b6ed25"
              },
              {
                "_id": "64e7b2c4da61820013dfe47d",
                "content": [
                  "Using public transportation tends to reduce the overall number of vehicles on the road. This reduces vehicle emissions and exposure to air pollution."
                ],
                "title": "Taxi or bus",
                "createdAt": "2023-08-24T19:43:00.072Z",
                "updatedAt": "2023-08-24T20:28:39.058Z",
                "__v": 0,
                "kya_question": "64e714d04c07320013b6ed25"
              },
              {
                "_id": "64e7b30ada61820013dfe482",
                "content": [
                  "When using a boda boda, wear a mask to protect yourself from inhaling dust and pollutants.",
                  "Boda boda riders are encouraged to carry out proper engine maintenance."
                ],
                "title": "Boda boda / motorbike",
                "createdAt": "2023-08-24T19:44:10.746Z",
                "updatedAt": "2023-08-24T20:28:39.058Z",
                "__v": 0,
                "kya_question": "64e714d04c07320013b6ed25"
              },
              {
                "_id": "64e7b324da61820013dfe486",
                "content": [
                  "Walk on sidewalks that are farther away from roadways as this will help reduce exposure to vehicle emissions.",
                  "Before heading out, check for the air quality in your location via the AirQo app. Consider taking alternative transportation or using alternative routes if air quality is poor.",
                  "Wear a mask if you walk during high pollution hours like the early morning (7am–10am) and late evening when traffic is heavier.",
                  "If possible, choose routes that avoid areas with known sources of pollution, like construction sites or industrial zones."
                ],
                "title": "Walking",
                "createdAt": "2023-08-24T19:44:37.006Z",
                "updatedAt": "2023-08-24T20:28:39.058Z",
                "__v": 0,
                "kya_question": "64e714d04c07320013b6ed25"
              }
            ]
          }
        ]
      }
    ]
  };

  group('Quizzes', () {
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
              '${AirQoUrls.kya}/quizzes?tenant=airqo&TOKEN=${Config.airqoApiV2Token}'),
          headers: headers,
        ),
      ).thenAnswer(
        (_) async => http.Response(
          jsonEncode(mockedResponse),
          200,
        ),
      );

      AirqoApiClient airqoApiClient = AirqoApiClient(client: client);
      List<Quiz> quizzes = await airqoApiClient.fetchQuizzes("");

      expect(quizzes.length, 1); // Expect a single Quiz object
      Quiz quiz = quizzes[0];
      expect(quiz.activeQuestion, 1);
      expect(quiz.status, QuizStatus.todo);
      expect(quiz.questions.isNotEmpty, true);
    });
  });
}
