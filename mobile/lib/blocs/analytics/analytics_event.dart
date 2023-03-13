part of 'analytics_bloc.dart';

abstract class AnalyticsEvent extends Equatable {
  const AnalyticsEvent();
}

class RefreshAnalytics extends AnalyticsEvent {
  const RefreshAnalytics();
  @override
  List<Object?> get props => [];
}

class ClearAnalytics extends AnalyticsEvent {
  const ClearAnalytics();
  @override
  List<Object?> get props => [];
}
