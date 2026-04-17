import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract class ExposureRepository {
  /// Returns the user's declared places. Empty list if none saved yet.
  Future<List<DeclaredPlace>> getDeclaredPlaces();

  /// Persists the full list of declared places (replace semantics).
  Future<void> saveDeclaredPlaces(List<DeclaredPlace> places);
}
