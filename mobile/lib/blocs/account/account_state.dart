part of 'account_bloc.dart';

class AccountState extends Equatable {
  const AccountState._({
    this.profile,
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState({
    this.profile,
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState.initial() : this._();

  AccountState copyWith({
    Profile? profile,
    bool? guestUser,
    BlocStatus? blocStatus,
    AuthenticationError? blocError,
  }) {
    return AccountState(
      profile: profile ?? this.profile,
      guestUser: guestUser ?? this.guestUser,
      blocStatus: blocStatus ?? this.blocStatus,
      blocError: blocError ?? this.blocError,
    );
  }

  final Profile? profile;
  final bool guestUser;
  final BlocStatus blocStatus;
  final AuthenticationError blocError;

  @override
  List<Object?> get props => [
        profile,
        guestUser,
        blocStatus,
      ];
}
