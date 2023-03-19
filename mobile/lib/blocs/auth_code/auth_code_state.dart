part of 'auth_code_bloc.dart';

enum AuthCodeStatus {
  initial,
  invalidCode,
  error,
  success;
}

class AuthCodeState extends Equatable {
  const AuthCodeState({
    this.errorMessage = '',
    this.inputAuthCode = '',
    this.codeCountDown = 5,
    this.emailAuthModel,
    this.status = AuthCodeStatus.initial,
    this.authProcedure = AuthProcedure.signup,
    this.authMethod = AuthMethod.phone,
  });

  AuthCodeState copyWith({
    String? errorMessage,
    String? inputAuthCode,
    int? codeCountDown,
    AuthCodeStatus? status,
    EmailAuthModel? emailAuthModel,
    AuthMethod? authMethod,
    AuthProcedure? authProcedure,
  }) {
    return AuthCodeState(
      status: status ?? this.status,
      inputAuthCode: inputAuthCode ?? this.inputAuthCode,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      errorMessage: errorMessage ?? this.errorMessage,
      emailAuthModel: emailAuthModel ?? this.emailAuthModel,
      authProcedure: authProcedure ?? this.authProcedure,
      authMethod: authMethod ?? this.authMethod,
    );
  }

  final AuthCodeStatus status;
  final int codeCountDown;
  final String errorMessage;
  final EmailAuthModel? emailAuthModel;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;
  final String inputAuthCode;

  @override
  List<Object?> get props => [
        emailAuthModel,
        errorMessage,
        authProcedure,
        status,
        codeCountDown,
        authMethod,
        inputAuthCode,
      ];
}
