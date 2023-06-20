part of 'email_verification_bloc.dart';

abstract class EmailVerificationEvent extends Equatable {
  const EmailVerificationEvent();
}

class InitializeEmailVerification extends EmailVerificationEvent {
  const InitializeEmailVerification({
    required this.emailAuthModel,
    required this.authProcedure,
  });
  final EmailAuthModel emailAuthModel;
  final AuthProcedure authProcedure;

  @override
  List<Object> get props => [emailAuthModel, authProcedure];
}

class SetEmailVerificationStatus extends EmailVerificationEvent {
  const SetEmailVerificationStatus(this.status);

  final AuthenticationStatus status;

  @override
  List<Object?> get props => [status];
}

class UpdateEmailVerificationCountDown extends EmailVerificationEvent {
  const UpdateEmailVerificationCountDown(this.countDown);
  final int countDown;
  @override
  List<Object> get props => [countDown];
}
