part of 'declared_places_cubit.dart';

abstract class DeclaredPlacesState extends Equatable {
  const DeclaredPlacesState();
  @override
  List<Object?> get props => [];
}

class DeclaredPlacesInitial extends DeclaredPlacesState {}

class DeclaredPlacesLoaded extends DeclaredPlacesState {
  /// Fully declared places (type + optional time windows set by user).
  final List<DeclaredPlace> places;

  const DeclaredPlacesLoaded({required this.places});

  @override
  List<Object?> get props => [places];
}
