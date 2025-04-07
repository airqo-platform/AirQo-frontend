part of 'user_bloc.dart';

sealed class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object> get props => [];
}

final class LoadUser extends UserEvent {}

final class UpdateUser extends UserEvent {
  final String firstName;
  final String lastName;
  final String email;
  final String profilePicture;

  const UpdateUser({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.profilePicture,
  });

  @override
  List<Object> get props => [firstName, lastName, email, profilePicture];
}