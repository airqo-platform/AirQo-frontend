part of 'analytics_bloc.dart';

enum AnalyticsError {
  noInternetConnection,
  none;
}

enum AnalyticsStatus {
  error,
  initial;
}

class AnalyticsState extends Equatable {
  const AnalyticsState._({
    this.analytics = const [],
    this.status = AnalyticsStatus.initial,
    this.error = AnalyticsError.none,
  });

  const AnalyticsState({
    this.analytics = const [],
    this.status = AnalyticsStatus.initial,
    this.error = AnalyticsError.none,
  });

  const AnalyticsState.initial() : this._();

  AnalyticsState copyWith({
    List<Analytics>? analytics,
    AnalyticsStatus? status,
    AnalyticsError? error,
  }) {
    return AnalyticsState(
      analytics: analytics ?? this.analytics,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }

  final List<Analytics> analytics;
  final AnalyticsStatus status;
  final AnalyticsError error;

  @override
  List<Object?> get props => [
        analytics,
        status,
        error,
      ];
}
