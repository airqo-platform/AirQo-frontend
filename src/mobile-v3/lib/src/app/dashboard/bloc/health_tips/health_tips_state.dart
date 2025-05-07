part of 'health_tips_bloc.dart';

abstract class HealthTipsState extends Equatable {
  const HealthTipsState();
  
  @override
  List<Object> get props => [];
}

class HealthTipsInitial extends HealthTipsState {}

class HealthTipsLoading extends HealthTipsState {}

class HealthTipsLoaded extends HealthTipsState {
  final List<HealthTipModel> healthTips;

  const HealthTipsLoaded(this.healthTips);

  @override
  List<Object> get props => [healthTips];
}

class HealthTipForAqiLoaded extends HealthTipsState {
  final HealthTipModel healthTip;

  const HealthTipForAqiLoaded(this.healthTip);

  @override
  List<Object> get props => [healthTip];
}

class HealthTipsError extends HealthTipsState {
  final String message;

  const HealthTipsError(this.message);

  @override
  List<Object> get props => [message];
}