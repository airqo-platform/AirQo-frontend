import 'dart:collection';

import 'package:app/models/site.dart';
import 'package:app/services/local_storage.dart';
import 'package:app/utils/extensions.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:uuid/uuid.dart';

import 'measurement.dart';

part 'place_details.g.dart';

@JsonSerializable(explicitToJson: true)
class PlaceDetails {
  String name;
  String location;
  String siteId;
  String placeId = const Uuid().v4();
  double latitude;
  double longitude;

  PlaceDetails(this.name, this.location, this.siteId, this.placeId,
      this.latitude, this.longitude);

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
        measurement.site.getName(),
        measurement.site.getLocation(),
        measurement.site.id,
        const Uuid().v4(),
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
        const Uuid().v4(), site.latitude, site.longitude);
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

// Future<void> loadFavouritePlaces(List<PlaceDetails> places) async {
//   try {
//     await _dbHelper.setFavouritePlaces(places).then((value) => {
//           reloadFavouritePlaces(),
//         });
//   } catch (exception, stackTrace) {
//     debugPrint('$exception\n$stackTrace');
//     await Sentry.captureException(
//       exception,
//       stackTrace: stackTrace,
//     );
//   }
// }

}

extension PlaceDetailsExtension on List<PlaceDetails> {
  List<Map<String, dynamic>> toJson() {
    var jsonObject = <Map<String, dynamic>>[];
    for (var place in this) {
      jsonObject.add(place.toJson());
    }
    return jsonObject;
  }

  List<PlaceDetails> removeDuplicates() {
    /// TODO
    /// implement remove duplicates and update loadFavPlaces()
    /// method in AppService
    return [];
  }
}
