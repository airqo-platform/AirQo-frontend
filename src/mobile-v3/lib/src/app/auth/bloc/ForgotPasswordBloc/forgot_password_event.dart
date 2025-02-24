import 'package:equatable/equatable.dart';

abstract class PasswordResetEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class RequestPasswordReset extends PasswordResetEvent {
  final String email;

  RequestPasswordReset(this.email);

  @override
  List<Object?> get props => [email];
}

class UpdatePassword extends PasswordResetEvent {
  final String confirmPassword;
  final String password;
  final String token;

  UpdatePassword({
    required this.confirmPassword,
    required this.password,
    required this.token,
  });

  @override
  List<Object?> get props => [confirmPassword, password, token];
}

class VerifyResetCodeEvent extends PasswordResetEvent {
  final String pin;

  VerifyResetCodeEvent(this.pin);

  @override
  List<Object?> get props => [pin];
}

