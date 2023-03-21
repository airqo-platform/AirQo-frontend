part of 'email_auth_bloc.dart';

abstract class EmailAuthEvent extends Equatable {
  const EmailAuthEvent();
}

class InitializeEmailAuth extends EmailAuthEvent {
  const InitializeEmailAuth({
    required this.emailAddress,
    required this.authProcedure,
  });
  final String emailAddress;
  final AuthProcedure authProcedure;

  @override
  List<Object> get props => [emailAddress, authProcedure];
}

class UpdateEmailAddress extends EmailAuthEvent {
  const UpdateEmailAddress(this.emailAddress);
  final String emailAddress;
  @override
  List<Object> get props => [emailAddress];
}

class ClearEmailAddress extends EmailAuthEvent {
  const ClearEmailAddress();
  @override
  List<Object?> get props => [];
}

class ValidateEmailAddress extends EmailAuthEvent {
  const ValidateEmailAddress();

  @override
  List<Object?> get props => [];
}
