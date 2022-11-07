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

class InitiatePhoneNumberVerification extends PhoneAuthEvent {
  const InitiatePhoneNumberVerification({
    required this.context,
  });
  final BuildContext context;
  @override
  List<Object?> get props => [];
}

class UpdateStatus extends PhoneAuthEvent {
  const UpdateStatus(this.authStatus);
  final BlocStatus authStatus;
  @override
  List<Object?> get props => [authStatus];
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

class InvalidPhoneNumber extends PhoneAuthEvent {
  const InvalidPhoneNumber();
  @override
  List<Object?> get props => [];
}
