import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';

abstract class MapRepository extends BaseRepository {
  Future<AirQualityResponse> fetchAirQualityReadings();
}

class MapImpl extends MapRepository {
  @override
  Future<AirQualityResponse> fetchAirQualityReadings() async {
    Response response = await createGetRequest(ApiUtils.map, {
      "token" : dotenv.env['AIRQO_API_TOKEN']!
    });

    AirQualityResponse airQualityResponse =
        AirQualityResponse.fromJson(jsonDecode(response.body));

    return airQualityResponse;
  }
}
