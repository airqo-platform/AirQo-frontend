part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class FetchKya extends KyaEvent {
  const FetchKya();
  @override
  List<Object?> get props => [];
}

class RefreshKya extends KyaEvent {
  const RefreshKya();
  @override
  List<Object?> get props => [];
}

class ClearKya extends KyaEvent {
  const ClearKya();
  @override
  List<Object?> get props => [];
}

class UpdateKyaProgress extends KyaEvent {
  const UpdateKyaProgress({
    required this.visibleCardIndex,
    required this.kya,
  });
  final int visibleCardIndex;
  final Kya kya;

  @override
  List<Object?> get props => [
        visibleCardIndex,
        kya,
      ];
}
