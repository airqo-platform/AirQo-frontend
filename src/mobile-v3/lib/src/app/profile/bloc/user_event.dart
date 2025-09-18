part of 'user_bloc.dart';

sealed class UserEvent extends Equatable {
  const UserEvent();

  @override
  List<Object> get props => [];
}

final class LoadUser extends UserEvent {}

final class LoadUserWithRetry extends UserEvent {
  final int retryCount;
  
  const LoadUserWithRetry({this.retryCount = 0});
  
  @override
  List<Object> get props => [retryCount];
}

final class RetryLoadUser extends UserEvent {}

final class UpdateUser extends UserEvent {
  final String firstName;
  final String lastName;
  final String email;
  final String? profilePicture;

  const UpdateUser({
    required this.firstName,
    required this.lastName,
    required this.email,
    this.profilePicture,
  });

  @override
  List<Object> get props => [
        firstName,
        lastName,
        email,
        if (profilePicture != null) profilePicture!,
      ];
}

final class UpdateUserFields extends UserEvent {
  final Map<String, dynamic> fields;

  const UpdateUserFields({required this.fields});

  @override
  List<Object> get props => [fields];
}
