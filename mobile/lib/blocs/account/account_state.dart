part of 'account_bloc.dart';

class AccountState extends Equatable {
  const AccountState._({
    this.profile,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState({
    this.profile,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState.initial() : this._();

  AccountState copyWith({
    Profile? profile,
    BlocStatus? blocStatus,
    AuthenticationError? blocError,
  }) {
    return AccountState(
      profile: profile ?? this.profile,
      blocStatus: blocStatus ?? this.blocStatus,
      blocError: blocError ?? this.blocError,
    );
  }

  final Profile? profile;
  final BlocStatus blocStatus;
  final AuthenticationError blocError;

  @override
  List<Object?> get props => [
        profile,
        blocStatus,
      ];
}
