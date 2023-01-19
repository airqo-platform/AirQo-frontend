part of 'profile_bloc.dart';

class ProfileState extends Equatable {
  const ProfileState._({
    this.profile,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const ProfileState({
    this.profile,
    this.blocStatus = BlocStatus.initial,
    this.blocError = AuthenticationError.none,
  });

  const ProfileState.initial() : this._();

  ProfileState copyWith({
    Profile? profile,
    BlocStatus? blocStatus,
    AuthenticationError? blocError,
  }) {
    return ProfileState(
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
        blocError,
      ];
}
