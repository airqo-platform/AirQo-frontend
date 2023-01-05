part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class LoadKya extends KyaEvent {
  const LoadKya();
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
