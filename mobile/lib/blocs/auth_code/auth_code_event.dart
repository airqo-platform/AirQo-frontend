part of 'auth_code_bloc.dart';

abstract class AuthCodeEvent extends Equatable {
  const AuthCodeEvent();
}

class GuestUserEvent extends AuthCodeEvent {
  const GuestUserEvent();
  @override
  List<Object?> get props => [];
}

class InitializeAuthCodeState extends AuthCodeEvent {
  const InitializeAuthCodeState({this.phoneNumber, this.authProcedure});

  final String? phoneNumber;
  final AuthProcedure? authProcedure;

  @override
  List<Object?> get props => [phoneNumber, authProcedure];
}

class UpdateAuthCode extends AuthCodeEvent {
  const UpdateAuthCode({
    required this.value,
  });
  final String value;
  @override
  List<Object?> get props => [value];
}

class UpdateVerificationId extends AuthCodeEvent {
  const UpdateVerificationId(this.verificationId);
  final String verificationId;
  @override
  List<Object?> get props => [verificationId];
}

class VerifySmsCode extends AuthCodeEvent {
  const VerifySmsCode({this.credential});
  final PhoneAuthCredential? credential;
  @override
  List<Object?> get props => [];
}

class UpdateCountDown extends AuthCodeEvent {
  const UpdateCountDown(this.countDown);
  final int countDown;
  @override
  List<Object?> get props => [];
}

class ResendAuthCode extends AuthCodeEvent {
  const ResendAuthCode({required this.context});
  final BuildContext context;
  @override
  List<Object?> get props => [];
}
