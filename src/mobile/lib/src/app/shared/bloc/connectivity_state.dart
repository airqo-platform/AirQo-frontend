part of 'connectivity_bloc.dart';

abstract class ConnectivityState extends Equatable {
  const ConnectivityState();

  @override
  List<Object?> get props => [];
}

class ConnectivityInitial extends ConnectivityState {}

class ConnectivityOnline extends ConnectivityState {}

class ConnectivityOffline extends ConnectivityState {
  final bool isDismissed;

  const ConnectivityOffline([this.isDismissed = false]);
}
