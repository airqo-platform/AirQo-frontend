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
  final bool reappeared;

  const ConnectivityOffline(
      {this.isDismissed = false, this.reappeared = false});

  @override
  List<Object> get props => [isDismissed, reappeared];

  ConnectivityOffline copyWith({bool? isDismissed, bool? reappeared}) {
    return ConnectivityOffline(
      isDismissed: isDismissed ?? this.isDismissed,
      reappeared: reappeared ?? this.reappeared,
    );
  }
}
