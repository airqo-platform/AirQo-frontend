part of 'declared_places_cubit.dart';

abstract class DeclaredPlacesState extends Equatable {
  const DeclaredPlacesState();
  @override
  List<Object?> get props => [];
}

class DeclaredPlacesInitial extends DeclaredPlacesState {}

class DeclaredPlacesLoaded extends DeclaredPlacesState {
  /// Sites the user has explicitly added to their exposure view.
  /// A subset of these may also be in [places] (fully labelled).
  final List<String> addedSiteIds;

  /// Fully declared places (labelled + time windows set).
  final List<DeclaredPlace> places;

  const DeclaredPlacesLoaded({
    this.addedSiteIds = const [],
    required this.places,
  });

  @override
  List<Object?> get props => [addedSiteIds, places];
}
