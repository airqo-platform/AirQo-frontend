part of 'auth_bloc.dart';

sealed class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object> get props => [];
}

final class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthLoaded extends AuthState {
  final AuthPurpose authPurpose;

  const AuthLoaded(this.authPurpose);
}

class AuthLoadingError extends AuthState {
  final String message;

  const AuthLoadingError(this.message);
}

enum AuthPurpose { LOGIN, REGISTER }

final class GuestUser extends AuthState {}

final class AuthVerified extends AuthState {}


final class EmailUnverifiedError extends AuthLoadingError {
  final String email;

  const EmailUnverifiedError(super.message, this.email);
  
  @override
  List<Object> get props => [message, email];
}