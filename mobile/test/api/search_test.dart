import 'package:app/constants/constants.dart';
import 'package:app/models/models.dart';
import 'package:app/services/rest_api.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';

import 'package:flutter_test/flutter_test.dart';

@GenerateMocks([http.Client])
Future<void> main() async {
  await dotenv.load(fileName: Config.environmentFile);

  group('searchTests', () {
    test('autocomplete', () async {
      List<SearchResult> results = await SearchApiClient().search("kampala");
      expect(results.isEmpty, false);
    });

    test('placeDetails', () async {
      List<String> searchTerms = ['kampala', 'jinja', 'accra'];
      SearchResult? searchResult;
      for (String term in searchTerms) {
        List<SearchResult> results = await SearchApiClient().search(term);
        if (results.isNotEmpty) {
          searchResult = results.first;
          break;
        }
      }

      searchResult = await SearchApiClient().getPlaceDetails(searchResult!);
      expect(searchResult, isA<SearchResult>());
    });
  });
}
