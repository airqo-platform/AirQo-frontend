part of 'phone_auth_bloc.dart';

abstract class PhoneAuthEvent extends Equatable {
  const PhoneAuthEvent();
}

class InitializePhoneAuth extends PhoneAuthEvent {
  const InitializePhoneAuth({
    required this.phoneNumber,
    required this.authProcedure,
  });
  final String phoneNumber;
  final AuthProcedure authProcedure;
  @override
  List<Object?> get props => [];
}

class ClearPhoneNumberEvent extends PhoneAuthEvent {
  const ClearPhoneNumberEvent();
  @override
  List<Object?> get props => [];
}

class VerifyPhoneNumber extends PhoneAuthEvent {
  const VerifyPhoneNumber(this.buildContext,
      {this.showConfirmationDialog = false});
  final BuildContext buildContext;
  final bool showConfirmationDialog;
  @override
  List<Object?> get props => [];
}

class UpdatePhoneAuthCode extends PhoneAuthEvent {
  const UpdatePhoneAuthCode(this.value);
  final String value;
  @override
  List<Object?> get props => [value];
}

class ClearPhoneAuthCode extends PhoneAuthEvent {
  const ClearPhoneAuthCode();
  @override
  List<Object?> get props => [];
}

class VerifyPhoneAuthCode extends PhoneAuthEvent {
  const VerifyPhoneAuthCode({this.credential});
  final PhoneAuthCredential? credential;
  @override
  List<Object?> get props => [credential];
}

class PhoneAutoVerificationCompleted extends PhoneAuthEvent {
  const PhoneAutoVerificationCompleted(this.authCredential);
  final PhoneAuthCredential authCredential;
  @override
  List<Object?> get props => [authCredential];
}

class PhoneVerificationException extends PhoneAuthEvent {
  const PhoneVerificationException(this.exception);

  final FirebaseAuthException exception;
  @override
  List<Object?> get props => [exception];
}

class UpdatePhoneCountDown extends PhoneAuthEvent {
  const UpdatePhoneCountDown(this.countDown);
  final int countDown;
  @override
  List<Object?> get props => [];
}

class PhoneVerificationCodeSent extends PhoneAuthEvent {
  const PhoneVerificationCodeSent(this.verificationId, {this.resendingToken});
  final String verificationId;
  final int? resendingToken;
  @override
  List<Object?> get props => [verificationId];
}

class PhoneAutoVerificationTimeout extends PhoneAuthEvent {
  const PhoneAutoVerificationTimeout(this.verificationId);
  final String verificationId;
  @override
  List<Object?> get props => [verificationId];
}

class UpdateCountryCode extends PhoneAuthEvent {
  const UpdateCountryCode(this.code);
  final String code;
  @override
  List<Object?> get props => [code];
}

class UpdatePhoneNumber extends PhoneAuthEvent {
  const UpdatePhoneNumber(this.phoneNumber);
  final String phoneNumber;
  @override
  List<Object?> get props => [phoneNumber];
}
