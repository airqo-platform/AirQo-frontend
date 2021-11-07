import 'dart:collection';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/site.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/local_storage.dart';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

import 'measurement.dart';

part 'place_details.g.dart';

@JsonSerializable()
class PlaceDetails {
  final String name;
  final String location;
  final String siteId;
  final double latitude;
  final double longitude;

  PlaceDetails(
      this.name, this.location, this.siteId, this.latitude, this.longitude);

  factory PlaceDetails.fromJson(Map<String, dynamic> json) =>
      _$PlaceDetailsFromJson(json);

  PlaceDetails initialize() {
    return PlaceDetails(
        '', '', '', AppConfig.defaultLatitude, AppConfig.defaultLongitude);
  }

  Map<String, dynamic> toJson() => _$PlaceDetailsToJson(this);

 static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${dbFavPlacesName()}('
      'siteId TEXT PRIMARY KEY, latitude REAL, '
      'location TEXT, longitude REAL, '
      'name TEXT)';
  static String dbFavPlacesName() => 'fav_places';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbFavPlacesName()}';

  static bool isFavouritePlace(
      List<PlaceDetails> favouritePlaces, PlaceDetails subject) {
    for (var place in favouritePlaces) {
      if (place.siteId == subject.siteId) {
        return true;
      }
    }
    return false;
  }

  static  List<Map<String, dynamic>> listToJson(List<PlaceDetails> places){
    var placesJson = <Map<String, dynamic>>[];
    for (var place in places) {
      var placeJson = place.toJson();
      placesJson.add(placeJson);
    }
    return placesJson;
  }

  static PlaceDetails measurementToPLace(Measurement measurement) {
    return PlaceDetails(
        measurement.site.getName(),
        measurement.site.getLocation(),
        measurement.site.id,
        measurement.site.latitude,
        measurement.site.longitude);
  }

  static List<PlaceDetails> parsePlaceDetails(dynamic jsonBody) {
    var placeDetails = <PlaceDetails>[];

    for (var jsonElement in jsonBody) {
      try {
        var placeDetail = PlaceDetails.fromJson(jsonElement);
        placeDetails.add(placeDetail);
      } catch (e) {
        debugPrint(e.toString());
      }
    }
    return placeDetails;
  }

  static PlaceDetails siteToPLace(Site site) {
    return PlaceDetails(site.getName(), site.getLocation(), site.id,
        site.latitude, site.longitude);
  }
}

class PlaceDetailsModel extends ChangeNotifier {
  final List<PlaceDetails> _favouritePlaces = [];
  final DBHelper _dbHelper = DBHelper();
  final CloudStore _cloudStore = CloudStore();
  final CustomAuth _customAuth = CustomAuth();

  UnmodifiableListView<PlaceDetails> get favouritePlaces =>
      UnmodifiableListView(_favouritePlaces);

  Future<void> reloadFavouritePlaces() async {
    _favouritePlaces.clear();

    var favPlaces = await _dbHelper.getFavouritePlaces();
    _favouritePlaces.addAll(favPlaces);
    notifyListeners();
    var id = _customAuth.getId();
    if (id != '') {
      await _cloudStore.updateFavouritePlaces(id, favPlaces);
    }
  }
}
