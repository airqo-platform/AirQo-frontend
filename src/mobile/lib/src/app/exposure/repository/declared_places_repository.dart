import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract class DeclaredPlacesRepository {
  Future<List<DeclaredPlace>> getDeclaredPlaces({bool forceRefresh = false});
  Future<void> saveDeclaredPlaces(List<DeclaredPlace> places);
}
