import 'dart:collection';

import 'package:app/constants/config.dart';
import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/string_extension.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'measurement.dart';

part 'place_details.g.dart';

@JsonSerializable(explicitToJson: true)
class PlaceDetails {
  String name;
  String location;
  String siteId;
  double latitude;
  double longitude;

  PlaceDetails(
      this.name, this.location, this.siteId, this.latitude, this.longitude);

  factory PlaceDetails.fromJson(Map<String, dynamic> json) =>
      _$PlaceDetailsFromJson(json);

  String getLocation() {
    if (location.isNull()) {
      return '';
    }
    return location;
  }

  String getName() {
    if (name.isNull()) {
      return getLocation();
    }
    return name;
  }

  PlaceDetails initialize() {
    return PlaceDetails(
        '', '', '', Config.defaultLatitude, Config.defaultLongitude);
  }

  Map<String, dynamic> toJson() => _$PlaceDetailsToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'siteId TEXT PRIMARY KEY, latitude REAL, '
      'location TEXT, longitude REAL, '
      'name TEXT)';

  static String dbName() => 'fav_places';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${dbName()}';

  static bool isFavouritePlace(
      List<PlaceDetails> favouritePlaces, PlaceDetails subject) {
    for (var place in favouritePlaces) {
      if (place.siteId == subject.siteId) {
        return true;
      }
    }
    return false;
  }

  static List<Map<String, dynamic>> listToJson(List<PlaceDetails> places) {
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

  static List<PlaceDetails> parseMultiPlaceDetails(dynamic jsonBody) {
    var placeDetails = <PlaceDetails>[];

    for (var jsonElement in jsonBody) {
      try {
        var placeDetail = PlaceDetails.fromJson(jsonElement);
        placeDetails.add(placeDetail);
      } catch (exception, stackTrace) {
        debugPrint('$exception\n$stackTrace');
      }
    }
    return placeDetails;
  }

  static PlaceDetails? parsePlaceDetails(dynamic jsonBody) {
    try {
      return PlaceDetails.fromJson(jsonBody);
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
    }
    return null;
  }

  static PlaceDetails siteToPLace(Site site) {
    return PlaceDetails(site.getName(), site.getLocation(), site.id,
        site.latitude, site.longitude);
  }
}

class PlaceDetailsModel extends ChangeNotifier {
  final List<PlaceDetails> _favouritePlaces = [];
  final DBHelper _dbHelper = DBHelper();

  // final CloudStore _cloudStore = CloudStore();
  // final CustomAuth _customAuth = CustomAuth();

  UnmodifiableListView<PlaceDetails> get favouritePlaces =>
      UnmodifiableListView(_favouritePlaces);

  Future<void> clearFavouritePlaces() async {
    try {
      _favouritePlaces.clear();
      await _dbHelper.clearFavouritePlaces();
      notifyListeners();
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> loadFavouritePlaces(List<PlaceDetails> places) async {
    try {
      // _favouritePlaces.addAll(places);
      // notifyListeners();
      await _dbHelper.setFavouritePlaces(places).then((value) => {
            reloadFavouritePlaces(),
          });
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }

  Future<void> reloadFavouritePlaces() async {
    try {
      _favouritePlaces.clear();

      var favPlaces = await _dbHelper.getFavouritePlaces();
      _favouritePlaces.addAll(favPlaces);
      notifyListeners();
      // var id = _customAuth.getId();
      // if (_customAuth.isLoggedIn() && id != '') {
      //   await _cloudStore.updateFavouritePlaces(id, favPlaces);
      // }
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}
