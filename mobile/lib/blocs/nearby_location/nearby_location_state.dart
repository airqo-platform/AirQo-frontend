part of 'nearby_location_bloc.dart';

enum NearbyLocationStatus {
  searchComplete,
  searching,
  locationDisabled,
}

class NearbyLocationState extends Equatable {
  const NearbyLocationState({
    this.locationAirQuality,
    this.surroundingSites = const [],
    this.blocStatus = NearbyLocationStatus.searching,
    this.showErrorMessage = true,
  });

  NearbyLocationState copyWith(
    AirQualityReading? locationAirQuality, {
    NearbyLocationStatus? blocStatus,
    List<AirQualityReading>? surroundingSites,
    bool? showErrorMessage,
  }) {
    return NearbyLocationState(
      locationAirQuality: locationAirQuality,
      surroundingSites: surroundingSites ?? this.surroundingSites,
      blocStatus: blocStatus ?? this.blocStatus,
      showErrorMessage: showErrorMessage ?? this.showErrorMessage,
    );
  }

  final NearbyLocationStatus blocStatus;
  final AirQualityReading? locationAirQuality;
  final List<AirQualityReading> surroundingSites;
  final bool showErrorMessage;

  @override
  List<Object?> get props => [
        blocStatus,
        showErrorMessage,
        locationAirQuality,
        surroundingSites,
      ];
}
