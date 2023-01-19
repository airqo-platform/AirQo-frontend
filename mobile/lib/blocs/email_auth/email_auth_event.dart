part of 'email_auth_bloc.dart';

abstract class EmailAuthEvent extends Equatable {
  const EmailAuthEvent();
}

class ValidateEmailAddress extends EmailAuthEvent {
  const ValidateEmailAddress(
    this.context, {
    this.showConfirmationDialog = true,
  });

  final BuildContext context;
  final bool showConfirmationDialog;
  @override
  List<Object?> get props => [context, showConfirmationDialog];
}

class EmailVerificationCodeSent extends EmailAuthEvent {
  const EmailVerificationCodeSent({
    required this.verificationLink,
    required this.token,
  });
  final String verificationLink;
  final int token;
  @override
  List<Object?> get props => [token, verificationLink];
}

class InitializeEmailAuth extends EmailAuthEvent {
  const InitializeEmailAuth({
    required this.emailAddress,
    required this.authProcedure,
  });
  final String emailAddress;
  final AuthProcedure authProcedure;
  @override
  List<Object?> get props => [emailAddress, authProcedure];
}

class EmailValidationFailed extends EmailAuthEvent {
  const EmailValidationFailed();
  @override
  List<Object?> get props => [];
}

class UpdateEmailCountDown extends EmailAuthEvent {
  const UpdateEmailCountDown(this.countDown);
  final int countDown;
  @override
  List<Object?> get props => [];
}

class UpdateEmailAuthCode extends EmailAuthEvent {
  const UpdateEmailAuthCode(this.value);
  final String value;
  @override
  List<Object?> get props => [value];
}

class UpdateEmailAddress extends EmailAuthEvent {
  const UpdateEmailAddress(this.emailAddress);
  final String emailAddress;
  @override
  List<Object?> get props => [emailAddress];
}

class VerifyEmailCode extends EmailAuthEvent {
  const VerifyEmailCode();
  @override
  List<Object?> get props => [];
}

class ClearEmailAddress extends EmailAuthEvent {
  const ClearEmailAddress();
  @override
  List<Object?> get props => [];
}
