part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  initial,
  loaded,
  searching,
  error,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState({
    this.locationAirQuality,
    this.blocStatus = NearbyLocationStatus.initial,
    this.error = NearbyAirQualityError.none,
    this.showErrorMessage = true,
  });

  NearbyLocationState copyWith({
    AirQualityReading? locationAirQuality,
    NearbyLocationStatus? blocStatus,
    NearbyAirQualityError? error,
    bool? showErrorMessage,
  }) {
    return NearbyLocationState(
      locationAirQuality: locationAirQuality,
      blocStatus: blocStatus ?? this.blocStatus,
      error: error ?? this.error,
      showErrorMessage: showErrorMessage ?? this.showErrorMessage,
    );
  }

  final AirQualityReading? locationAirQuality;
  final NearbyLocationStatus blocStatus;
  final NearbyAirQualityError error;
  final bool showErrorMessage;

  @override
  List<Object?> get props => [
        error,
        locationAirQuality,
        blocStatus,
        showErrorMessage,
      ];
}
