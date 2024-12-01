import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:http/http.dart' as http;
import 'package:http/http.dart';

abstract class ForecastRepository extends BaseRepository {
  Future<ForecastResponse> loadForecasts(String siteId);
}

class ForecastImpl extends ForecastRepository {
  @override
  Future<ForecastResponse> loadForecasts(String siteId) async {
    Response forecastResponse = await http.get(
      Uri.parse(
          "https://api.airqo.net/api/v2/predict/daily-forecast?site_id=64e070b07898ba0013018767&token=EKFCNPGPC4TSM9RK"),
      headers: {"Accept": "*/*", "Content-Type": "application/json"},
    );

    ForecastResponse response =
        ForecastResponse.fromJson(json.decode(forecastResponse.body));

    return response;
  }
}
