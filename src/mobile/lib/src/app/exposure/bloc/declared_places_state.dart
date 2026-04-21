part of 'declared_places_cubit.dart';

abstract class DeclaredPlacesState extends Equatable {
  const DeclaredPlacesState();
  @override
  List<Object?> get props => [];
}

class DeclaredPlacesInitial extends DeclaredPlacesState {}

class DeclaredPlacesLoaded extends DeclaredPlacesState {
  final List<DeclaredPlace> places;
  // Empty map while readings are still loading; keyed by siteId once resolved.
  final Map<String, List<HourlyReading>> readings;

  const DeclaredPlacesLoaded({
    required this.places,
    this.readings = const {},
  });

  DeclaredPlacesLoaded withReadings(Map<String, List<HourlyReading>> readings) =>
      DeclaredPlacesLoaded(places: places, readings: readings);

  @override
  List<Object?> get props => [places, readings];
}
