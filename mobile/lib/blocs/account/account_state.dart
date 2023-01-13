part of 'account_bloc.dart';

class AccountState extends Equatable {
  const AccountState._({
    this.profile,
    this.notifications = const [],
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState({
    this.profile,
    this.notifications = const [],
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState.initial() : this._();

  AccountState copyWith({
    Profile? profile,
    List<AppNotification>? notifications,
    bool? guestUser,
    BlocStatus? blocStatus,
    AuthenticationError? blocError,
  }) {
    return AccountState(
      profile: profile ?? this.profile,
      notifications: notifications ?? this.notifications,
      guestUser: guestUser ?? this.guestUser,
      blocStatus: blocStatus ?? this.blocStatus,
      blocError: blocError ?? this.blocError,
    );
  }

  final Profile? profile;
  final List<AppNotification> notifications;
  final bool guestUser;
  final BlocStatus blocStatus;
  final AuthenticationError blocError;

  @override
  List<Object?> get props => [
        profile,
        notifications,
        guestUser,
        blocStatus,
      ];
}
