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
  const InitializeAuthCodeState(
      {this.phoneNumber,
      this.verificationId,
      this.credential,
      this.authProcedure});

  final String? phoneNumber;
  final String? verificationId;
  final PhoneAuthCredential? credential;
  final AuthProcedure? authProcedure;

  @override
  List<Object?> get props => [phoneNumber, verificationId, credential];
}

class UpdateAuthCode extends AuthCodeEvent {
  const UpdateAuthCode({
    required this.value,
    required this.position,
  });
  final String value;
  final int position;
  @override
  List<Object?> get props => [value, position];
}

class AuthenticatePhoneNumber extends AuthCodeEvent {
  const AuthenticatePhoneNumber({this.credential});
  final PhoneAuthCredential? credential;
  @override
  List<Object?> get props => [];
}

class ResendAuthCode extends AuthCodeEvent {
  const ResendAuthCode({this.credential});
  final PhoneAuthCredential? credential;
  @override
  List<Object?> get props => [];
}
