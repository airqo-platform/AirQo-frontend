part of 'auth_bloc.dart';

sealed class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class LoginUser extends AuthEvent {
  final String username;
  final String password;

  const LoginUser(this.username, this.password);
}

class RegisterUser extends AuthEvent {
  final RegisterInputModel model;

  const RegisterUser(this.model);
}
