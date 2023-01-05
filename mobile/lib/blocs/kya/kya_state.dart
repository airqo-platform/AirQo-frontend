part of 'kya_bloc.dart';

enum KyaError {
  noInternetConnection,
  none;
}

enum KyaStatus {
  error,
  initial;
}

class KyaState extends Equatable {
  const KyaState._({
    this.kya = const [],
    this.status = KyaStatus.initial,
    this.error = KyaError.none,
  });

  const KyaState({
    this.kya = const [],
    this.status = KyaStatus.initial,
    this.error = KyaError.none,
  });

  const KyaState.initial()
      : this._(
          error: KyaError.none,
          status: KyaStatus.initial,
        );

  KyaState copyWith({
    List<Kya>? kya,
    KyaStatus? status,
    KyaError? error,
  }) {
    return KyaState(
      status: status ?? this.status,
      kya: kya ?? this.kya,
      error: error ?? this.error,
    );
  }

  final List<Kya> kya;
  final KyaStatus status;
  final KyaError error;

  @override
  List<Object?> get props => [
        kya,
        kya.filterIncompleteKya().length,
        kya.filterCompleteKya().length,
        status,
        error,
      ];
}
