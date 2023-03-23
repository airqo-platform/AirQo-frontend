part of 'auth_code_bloc.dart';

abstract class AuthCodeEvent extends Equatable {
  const AuthCodeEvent();
}

class InitializeAuthCodeState extends AuthCodeEvent {
  const InitializeAuthCodeState({
    required this.authMethod,
    required this.authProcedure,
    this.phoneAuthModel,
    this.emailAuthModel,
  });

  final PhoneAuthModel? phoneAuthModel;
  final EmailAuthModel? emailAuthModel;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;

  @override
  List<Object?> get props =>
      [phoneAuthModel, authProcedure, emailAuthModel, authMethod];
}

class ClearAuthCodeState extends AuthCodeEvent {
  const ClearAuthCodeState();
  @override
  List<Object?> get props => [];
}

class UpdateAuthCode extends AuthCodeEvent {
  const UpdateAuthCode({
    required this.value,
  });
  final String value;
  @override
  List<Object?> get props => [value];
}

class VerifyAuthCode extends AuthCodeEvent {
  const VerifyAuthCode();

  @override
  List<Object?> get props => [];
}

class UpdateCountDown extends AuthCodeEvent {
  const UpdateCountDown(this.countDown);
  final int countDown;
  @override
  List<Object?> get props => [];
}

class UpdateAuthCodeStatus extends AuthCodeEvent {
  const UpdateAuthCodeStatus({
    this.status,
    this.errorMessage,
    this.loading,
  });
  final AuthCodeStatus? status;
  final String? errorMessage;
  final bool? loading;

  @override
  List<Object?> get props => [status, errorMessage, loading];
}

class ResendEmailAuthCode extends AuthCodeEvent {
  const ResendEmailAuthCode({required this.context});
  final BuildContext context;
  @override
  List<Object?> get props => [];
}
