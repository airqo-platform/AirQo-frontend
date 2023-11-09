part of 'profile_bloc.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();
}

class ClearProfile extends ProfileEvent {
  const ClearProfile();
  @override
  List<Object?> get props => [];
}

class SyncProfile extends ProfileEvent {
  const SyncProfile();
  @override
  List<Object?> get props => [];
}

class FetchProfile extends ProfileEvent {
  const FetchProfile();

  @override
  List<Object?> get props => [];
}

class UpdateProfile extends ProfileEvent {
  const UpdateProfile(this.profile);
  final Profile profile;

  @override
  List<Object?> get props => [];
}
