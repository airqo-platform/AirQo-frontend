part of 'auth_code_bloc.dart';

abstract class AuthCodeEvent extends Equatable {
  const AuthCodeEvent();
}

class InitializeAuthCodeState extends AuthCodeEvent {
  const InitializeAuthCodeState({
    required this.authMethod,
    required this.authProcedure,
    this.phoneNumber,
    this.emailAuthModel,
  });

  final String? phoneNumber;
  final EmailAuthModel? emailAuthModel;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;

  @override
  List<Object?> get props => [phoneNumber, authProcedure, emailAuthModel];
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

// class UpdateVerificationId extends AuthCodeEvent {
//   const UpdateVerificationId(this.verificationId);
//   final String verificationId;
//   @override
//   List<Object?> get props => [verificationId];
// }
//
class UpdateEmailAuthModel extends AuthCodeEvent {
  const UpdateEmailAuthModel(this.authModel);

  final EmailAuthModel authModel;
  @override
  List<Object> get props => [authModel];
}

class ResendAuthCode extends AuthCodeEvent {
  const ResendAuthCode({required this.context});
  final BuildContext context;
  @override
  List<Object?> get props => [];
}
