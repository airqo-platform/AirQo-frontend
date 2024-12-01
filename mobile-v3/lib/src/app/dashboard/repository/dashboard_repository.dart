import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/models/countries_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

abstract class DashboardRepository extends BaseRepository {
  Future<AirQualityResponse> fetchAirQualityReadings();
  Future<CountriesResponse> fetchCountryAirQualityReadings();
}

class DashboardImpl extends DashboardRepository {
  @override
  Future<AirQualityResponse> fetchAirQualityReadings() async {
        Response response = await createGetRequest(
        ApiUtils.map, {"token": dotenv.env['AIRQO_API_TOKEN']!});
    

    // final String data =
    //     await rootBundle.loadString('assets/data/new_data.json');

    AirQualityResponse dashboardResponse = AirQualityResponse.fromJson(jsonDecode(response.body));

    return dashboardResponse;
  }

  @override
  Future<CountriesResponse> fetchCountryAirQualityReadings() async {
    Response countriesResponse = await http.get(
      Uri.parse(
          "https://api.airqo.net/api/v2/devices/grids/summary?admin_level=country"),
      headers: {"Accept": "*/*", "Content-Type": "application/json"},
    );

    CountriesResponse response =
        CountriesResponse.fromJson(json.decode(countriesResponse.body));

    return response;
  }
}
