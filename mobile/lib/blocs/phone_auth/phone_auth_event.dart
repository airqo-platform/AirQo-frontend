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

class UpdateCountryCode extends PhoneAuthEvent {
  const UpdateCountryCode(this.code);
  final String code;
  @override
  List<Object?> get props => [code];
}

class ClearPhoneNumberEvent extends PhoneAuthEvent {
  const ClearPhoneNumberEvent();
  @override
  List<Object?> get props => [];
}

class UpdatePhoneAuthModel extends PhoneAuthEvent {
  const UpdatePhoneAuthModel(this.phoneAuthModel);
  final PhoneAuthModel phoneAuthModel;

  @override
  List<Object?> get props => [phoneAuthModel];
}

class UpdateStatus extends PhoneAuthEvent {
  const UpdateStatus({this.loading, this.status, this.errorMessage});
  final bool? loading;
  final PhoneAuthStatus? status;
  final String? errorMessage;

  @override
  List<Object?> get props => [loading, errorMessage, status];
}

class UpdatePhoneNumber extends PhoneAuthEvent {
  const UpdatePhoneNumber(this.phoneNumber);
  final String phoneNumber;
  @override
  List<Object?> get props => [phoneNumber];
}
