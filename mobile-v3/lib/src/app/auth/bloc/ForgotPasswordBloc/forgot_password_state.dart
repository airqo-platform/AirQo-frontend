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
  const PasswordResetLoading({String? email}) : super(email: email); // Optional email
}

class PasswordResetSuccess extends PasswordResetState {
  final String message;

  const PasswordResetSuccess({String? email, required this.message}) : super(email: email);

  @override
  List<Object?> get props => [email, message];
}

class PasswordResetError extends PasswordResetState {
  final String message;

  const PasswordResetError({String? email, required this.message})
      : super(email: email); // Optional email

  @override
  List<Object?> get props => [email, message]; // Nullable email
}

