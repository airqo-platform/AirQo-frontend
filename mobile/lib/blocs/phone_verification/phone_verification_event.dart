part of 'phone_verification_bloc.dart';

abstract class PhoneVerificationEvent extends Equatable {
  const PhoneVerificationEvent();
}

class InitializePhoneVerification extends PhoneVerificationEvent {
  const InitializePhoneVerification({
    required this.phoneAuthModel,
    required this.authProcedure,
  });
  final PhoneAuthModel phoneAuthModel;
  final AuthProcedure authProcedure;

  @override
  List<Object> get props => [phoneAuthModel, authProcedure];
}

class SetPhoneVerificationStatus extends PhoneVerificationEvent {
  const SetPhoneVerificationStatus(this.status);

  final AuthenticationStatus status;

  @override
  List<Object?> get props => [status];
}

class UpdatePhoneVerificationCountDown extends PhoneVerificationEvent {
  const UpdatePhoneVerificationCountDown(this.countDown);
  final int countDown;
  @override
  List<Object> get props => [countDown];
}
