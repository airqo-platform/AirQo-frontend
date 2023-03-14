part of 'profile_bloc.dart';

enum ProfileStatus {
  initial,
  processing,
  error,
  success,
  noInternetConnection,
}

class ProfileState extends Equatable {
  const ProfileState({
    required this.profile,
    required this.status,
    required this.message,
  });

  factory ProfileState.initial() => ProfileState(
        profile: Profile.initialize(),
        status: ProfileStatus.initial,
        message: '',
      );

  ProfileState copyWith({
    Profile? profile,
    ProfileStatus? status,
    String? message,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      status: status ?? this.status,
      message: message ?? this.message,
    );
  }

  final Profile profile;
  final ProfileStatus status;
  final String message;

  @override
  List<Object?> get props => [
        profile,
        status,
      ];
}
