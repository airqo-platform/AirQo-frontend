part of 'kya_bloc.dart';

enum KyaStatus {
  noInternetConnection,
  initial;
}

class KyaProgressCubit extends Cubit<double> {
  KyaProgressCubit() : super(0);

  void updateProgress(double value) => emit(value);
}

class KyaState extends Equatable {
  const KyaState({
    this.kya = const [],
    this.status = KyaStatus.initial,
  });

  KyaState copyWith({
    List<Kya>? kya,
    KyaStatus? status,
  }) {
    return KyaState(
      status: status ?? this.status,
      kya: kya ?? this.kya,
    );
  }

  final List<Kya> kya;
  final KyaStatus status;

  @override
  List<Object?> get props => [
        kya,
        kya.filterIncompleteKya().length,
        kya.filterCompleteKya().length,
        status,
      ];
}
