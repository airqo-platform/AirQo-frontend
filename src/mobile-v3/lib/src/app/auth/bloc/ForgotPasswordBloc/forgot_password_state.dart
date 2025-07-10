import 'package:equatable/equatable.dart';

abstract class PasswordResetState extends Equatable {
  final String? email;
  const PasswordResetState({this.email});

  @override
  List<Object?> get props => [email];
}

class PasswordResetInitial extends PasswordResetState {
  const PasswordResetInitial() : super();
}

class PasswordResetLoading extends PasswordResetState {
  const PasswordResetLoading({super.email});
}

class PasswordResetSuccess extends PasswordResetState {
  final String message;

  const PasswordResetSuccess({super.email, required this.message});

  @override
  List<Object?> get props => [email, message];
}

class PasswordResetError extends PasswordResetState {
  final String message;

  const PasswordResetError({super.email, required this.message}); 

  @override
  List<Object?> get props => [email, message]; 
}

class PasswordResetVerified extends PasswordResetState {
  final String message;
  final String? token;

  const PasswordResetVerified({super.email, required this.message, this.token});

  @override
  List<Object?> get props => [email, message, token];
}
