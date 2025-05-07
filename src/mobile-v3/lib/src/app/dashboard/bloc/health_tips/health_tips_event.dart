part of 'health_tips_bloc.dart';

abstract class HealthTipsEvent extends Equatable {
  const HealthTipsEvent();

  @override
  List<Object> get props => [];
}

class LoadHealthTips extends HealthTipsEvent {}

class GetHealthTipForAqi extends HealthTipsEvent {
  final double aqiValue;

  const GetHealthTipForAqi(this.aqiValue);

  @override
  List<Object> get props => [aqiValue];
}

class RefreshHealthTips extends HealthTipsEvent {
  final bool clearCache;

  const RefreshHealthTips({this.clearCache = true});

  @override
  List<Object> get props => [clearCache];
}