import 'dart:convert';

import 'package:airqo/src/app/other/places/models/airqo_latlng_response.dart';
import 'package:airqo/src/app/other/places/models/auto_complete_response.dart';
import 'package:airqo/src/app/other/places/models/place_details_response.dart';
import 'package:airqo/src/app/shared/repository/base_repository.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:http/http.dart' as http;

abstract class GooglePlacesRepository extends BaseRepository {
  Future<AutoCompleteResponse> searchPlaces(String term);
  Future<AirqoLatLngResponse> getPlaceDetails(String name);
}

class GooglePlacesImpl extends GooglePlacesRepository {
  @override
  Future<AutoCompleteResponse> searchPlaces(String term) async {
    Map<String, String> queryParams = {
      'input': term,
      'components': "country:UG|country:KE",
      "key": dotenv.env["GOOGLE_PLACES_API_KEY"]!
    };
    Uri url = Uri.https(
      "maps.googleapis.com",
      "maps/api/place/autocomplete/json",
      queryParams,
    );

    Response httpResponse = await http.get(url);

    AutoCompleteResponse response =
        AutoCompleteResponse.fromJson(json.decode(httpResponse.body));

    return response;
  }

  @override
  Future<AirqoLatLngResponse> getPlaceDetails(String name) async {
    Map<String, String> queryParams = {
      'input': name,
      'inputtype': "textquery",
      "fields": "geometry",
      "key": dotenv.env["GOOGLE_PLACES_API_KEY"]!
    };
    Uri url = Uri.https(
      "maps.googleapis.com",
      "maps/api/place/findplacefromtext/json",
      queryParams,
    );

    Response httpResponse = await http.get(url);

    PlaceDetailsResponse response =
        PlaceDetailsResponse.fromJson(json.decode(httpResponse.body));

    Map<String, String> airqoQueryParams = {
      "token": dotenv.env["AIRQO_API_TOKEN"]!
    };

    Response airqoResponse = await http.get(Uri.https(
        "api.airqo.net",
        "api/v2/devices/measurements/location/${response.candidates[0].geometry.location.lat}/${response.candidates[0].geometry.location.lng}",
        airqoQueryParams));

    AirqoLatLngResponse airqoLatLngResponse =
        await AirqoLatLngResponse.fromJson(json.decode(airqoResponse.body));

    return airqoLatLngResponse;
  }
}
