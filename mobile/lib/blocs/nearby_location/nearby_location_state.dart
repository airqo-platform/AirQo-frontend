part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  searchComplete,
  searching,
  locationDenied,
  locationDisabled,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState({
    this.locationAirQuality,
    this.blocStatus = NearbyLocationStatus.searching,
    this.showErrorMessage = true,
  });

  NearbyLocationState copyWith({
    AirQualityReading? locationAirQuality,
    NearbyLocationStatus? blocStatus,
    bool? showErrorMessage,
  }) {
    return NearbyLocationState(
      locationAirQuality: locationAirQuality,
      blocStatus: blocStatus ?? this.blocStatus,
      showErrorMessage: showErrorMessage ?? this.showErrorMessage,
    );
  }

  final AirQualityReading? locationAirQuality;
  final NearbyLocationStatus blocStatus;
  final bool showErrorMessage;

  @override
  List<Object?> get props => [
        locationAirQuality,
        blocStatus,
        showErrorMessage,
      ];
}
