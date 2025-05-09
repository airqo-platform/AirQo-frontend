part of 'auth_bloc.dart';

sealed class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object> get props => [];
}

class AppStarted extends AuthEvent {}


class LoginUser extends AuthEvent {
  final String username;
  final String password;

  const LoginUser(this.username, this.password);
}

class RegisterUser extends AuthEvent {
  final RegisterInputModel model;

  const RegisterUser(this.model);
}

class UseAsGuest extends AuthEvent {
  const UseAsGuest();
}

class VerifyEmailCode extends AuthEvent {
  final String token;
  final String email;

  const VerifyEmailCode(this.token, this.email);
  
  @override
  List<Object> get props => [token, email];
}

class ResendVerificationCode extends AuthEvent {
  final String email;

  const ResendVerificationCode(this.email);
  
  @override
  List<Object> get props => [email];
}

class LogoutUser extends AuthEvent {
  const LogoutUser();
}