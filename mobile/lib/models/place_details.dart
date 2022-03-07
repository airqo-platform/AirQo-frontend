import 'dart:collection';

import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:uuid/uuid.dart';

import 'measurement.dart';

part 'place_details.g.dart';

@JsonSerializable(explicitToJson: true)
class PlaceDetails {
  String name = '';
  String location = '';
  String siteId;
  String placeId = const Uuid().v4();
  double latitude;
  double longitude;

  PlaceDetails(
      {required this.name,
      required this.location,
      required this.siteId,
      required this.placeId,
      required this.latitude,
      required this.longitude});

  factory PlaceDetails.fromJson(Map<String, dynamic> json) =>
      _$PlaceDetailsFromJson(json);

  Map<String, dynamic> toJson() => _$PlaceDetailsToJson(this);

  static String createTableStmt() => 'CREATE TABLE IF NOT EXISTS ${dbName()}('
      'placeId TEXT PRIMARY KEY, latitude REAL, '
      'location TEXT, longitude REAL, siteId TEXT, name TEXT)';

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
        name: measurement.site.name,
        location: measurement.site.location,
        siteId: measurement.site.id,
        placeId: const Uuid().v4(),
        latitude: measurement.site.latitude,
        longitude: measurement.site.longitude);
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
    return PlaceDetails(
        name: site.name,
        location: site.location,
        siteId: site.id,
        placeId: const Uuid().v4(),
        latitude: site.latitude,
        longitude: site.longitude);
  }
}

class PlaceDetailsModel extends ChangeNotifier {
  final List<PlaceDetails> _favouritePlaces = [];
  final DBHelper _dbHelper = DBHelper();

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

  Future<void> reloadFavouritePlaces() async {
    try {
      _favouritePlaces.clear();
      var favPlaces = await _dbHelper.getFavouritePlaces();
      _favouritePlaces.addAll(favPlaces);
      notifyListeners();
    } catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      await Sentry.captureException(
        exception,
        stackTrace: stackTrace,
      );
    }
  }
}
