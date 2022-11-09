part of 'account_bloc.dart';

class AccountState extends Equatable {
  const AccountState._({
    this.profile,
    this.kya = const [],
    this.favouritePlaces = const [],
    this.notifications = const [],
    this.analytics = const [],
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState({
    this.profile,
    this.kya = const [],
    this.favouritePlaces = const [],
    this.notifications = const [],
    this.analytics = const [],
    this.guestUser = true,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const AccountState.initial() : this._();

  AccountState copyWith({
    Profile? profile,
    List<Kya>? kya,
    List<FavouritePlace>? favouritePlaces,
    List<AppNotification>? notifications,
    List<Analytics>? analytics,
    bool? guestUser,
    BlocStatus? blocStatus,
    AuthenticationError? blocError,
  }) {
    return AccountState(
      profile: profile ?? this.profile,
      kya: kya ?? this.kya,
      favouritePlaces: favouritePlaces ?? this.favouritePlaces,
      notifications: notifications ?? this.notifications,
      analytics: analytics ?? this.analytics,
      guestUser: guestUser ?? this.guestUser,
      blocStatus: blocStatus ?? this.blocStatus,
      blocError: blocError ?? this.blocError,
    );
  }

  final Profile? profile;
  final List<Kya> kya;
  final List<FavouritePlace> favouritePlaces;
  final List<AppNotification> notifications;
  final List<Analytics> analytics;
  final bool guestUser;
  final BlocStatus blocStatus;
  final AuthenticationError blocError;

  @override
  List<Object?> get props => [
        profile,
        kya,
        favouritePlaces,
        notifications,
        analytics,
        guestUser,
        blocStatus,
      ];
}
