import 'package:airqo/src/app/exposure/models/declared_place.dart';

abstract class DeclaredPlacesRepository {
  Future<List<DeclaredPlace>> getDeclaredPlaces();
  Future<void> saveDeclaredPlaces(List<DeclaredPlace> places);
}
