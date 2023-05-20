part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  searchComplete,
  searching,
  locationDisabled,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState({
    this.currentLocation,
    this.blocStatus = NearbyLocationStatus.searching,
    this.showErrorMessage = true,
  });

  NearbyLocationState copyWith({
    CurrentLocation? currentLocation,
    NearbyLocationStatus? blocStatus,
    bool? showErrorMessage,
  }) {
    return NearbyLocationState(
      currentLocation: currentLocation,
      blocStatus: blocStatus ?? this.blocStatus,
      showErrorMessage: showErrorMessage ?? this.showErrorMessage,
    );
  }

  final NearbyLocationStatus blocStatus;
  final CurrentLocation? currentLocation;
  final bool showErrorMessage;

  @override
  List<Object?> get props => [
        blocStatus,
        showErrorMessage,
        currentLocation,
      ];
}
