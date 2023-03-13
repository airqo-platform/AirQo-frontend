part of 'analytics_bloc.dart';

enum AnalyticsStatus {
  error,
  noInternetConnection,
  initial;
}

class AnalyticsState extends Equatable {
  const AnalyticsState._({
    this.analytics = const [],
    this.status = AnalyticsStatus.initial,
  });

  const AnalyticsState({
    this.analytics = const [],
    this.status = AnalyticsStatus.initial,
  });

  const AnalyticsState.initial() : this._();

  AnalyticsState copyWith({
    List<Analytics>? analytics,
    AnalyticsStatus? status,
  }) {
    return AnalyticsState(
      analytics: analytics ?? this.analytics,
      status: status ?? this.status,
    );
  }

  final List<Analytics> analytics;
  final AnalyticsStatus status;

  @override
  List<Object?> get props => [
        analytics,
        status,
      ];
}
