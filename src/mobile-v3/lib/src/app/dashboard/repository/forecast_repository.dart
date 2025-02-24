import 'dart:convert';

import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:airqo/src/meta/utils/api_utils.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';

abstract class ForecastRepository extends BaseRepository {
  Future<ForecastResponse> loadForecasts(String siteId);
}

class ForecastImpl extends ForecastRepository {
  @override
  Future<ForecastResponse> loadForecasts(String siteId) async {
    Response forecastResponse = await createGetRequest(ApiUtils.fetchForecasts,
        {"token": dotenv.env['AIRQO_API_TOKEN']!, "site_id": siteId});

    ForecastResponse response =
        ForecastResponse.fromJson(json.decode(forecastResponse.body));

    return response;
  }
}
