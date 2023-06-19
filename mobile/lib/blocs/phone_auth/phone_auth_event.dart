part of 'phone_auth_bloc.dart';

abstract class PhoneAuthEvent extends Equatable {
  const PhoneAuthEvent();
}

class InitializePhoneAuth extends PhoneAuthEvent {
  const InitializePhoneAuth(this.authProcedure);

  final AuthProcedure authProcedure;
  @override
  List<Object> get props => [authProcedure];
}

class SetPhoneAuthStatus extends PhoneAuthEvent {
  const SetPhoneAuthStatus(this.status, {this.errorMessage});

  final AuthenticationStatus status;
  final String? errorMessage;

  @override
  List<Object?> get props => [
        status,
        errorMessage,
      ];
}
