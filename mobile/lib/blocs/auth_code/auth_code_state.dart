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
    this.phoneAuthModel,
    this.status = AuthCodeStatus.initial,
    this.authProcedure = AuthProcedure.signup,
    this.authMethod = AuthMethod.phone,
    this.loading = false,
  });

  AuthCodeState copyWith({
    String? errorMessage,
    String? inputAuthCode,
    int? codeCountDown,
    AuthCodeStatus? status,
    EmailAuthModel? emailAuthModel,
    PhoneAuthModel? phoneAuthModel,
    AuthMethod? authMethod,
    AuthProcedure? authProcedure,
    bool? loading,
  }) {
    return AuthCodeState(
      status: status ?? this.status,
      inputAuthCode: inputAuthCode ?? this.inputAuthCode,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      errorMessage: errorMessage ?? "",
      emailAuthModel: emailAuthModel ?? this.emailAuthModel,
      phoneAuthModel: phoneAuthModel ?? this.phoneAuthModel,
      authProcedure: authProcedure ?? this.authProcedure,
      authMethod: authMethod ?? this.authMethod,
      loading: loading ?? false,
    );
  }

  final AuthCodeStatus status;
  final int codeCountDown;
  final String errorMessage;
  final EmailAuthModel? emailAuthModel;
  final PhoneAuthModel? phoneAuthModel;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;
  final String inputAuthCode;
  final bool loading;

  @override
  List<Object?> get props => [
        emailAuthModel,
        phoneAuthModel,
        errorMessage,
        authProcedure,
        status,
        codeCountDown,
        authMethod,
        inputAuthCode,
        loading,
      ];
}
