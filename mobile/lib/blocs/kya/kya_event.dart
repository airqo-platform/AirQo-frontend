part of 'kya_bloc.dart';

abstract class KyaEvent extends Equatable {
  const KyaEvent();
}

class SyncKya extends KyaEvent {
  const SyncKya();
  @override
  List<Object?> get props => [];
}

class ClearKya extends KyaEvent {
  const ClearKya();
  @override
  List<Object?> get props => [];
}

class UpdateKyaProgress extends KyaEvent {
  const UpdateKyaProgress(
    this.kya, {
    required this.visibleCardIndex,
  });
  final int visibleCardIndex;
  final Kya kya;

  @override
  List<Object?> get props => [visibleCardIndex, kya];
}

class CompleteKya extends KyaEvent {
  const CompleteKya(this.kya);
  final Kya kya;

  @override
  List<Object> get props => [kya];
}

class PartiallyCompleteKya extends KyaEvent {
  const PartiallyCompleteKya(this.kya);
  final Kya kya;

  @override
  List<Object> get props => [kya];
}
