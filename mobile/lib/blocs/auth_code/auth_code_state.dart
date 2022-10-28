part of 'auth_code_bloc.dart';

class AuthCodeState extends Equatable {
  const AuthCodeState._({
    this.emailAddress = '',
    this.phoneNumber = '',
    this.verificationId = '',
    this.credential = null,
    this.authProcedure = AuthProcedure.login,
    this.inputAuthCode = '',
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
    this.codeCountDown = 5,
    this.authMethod = AuthMethod.phone,
  });

  const AuthCodeState({
    this.phoneNumber = '',
    this.codeCountDown = 5,
    this.verificationId = '',
    this.credential = null,
    this.authProcedure = AuthProcedure.login,
    this.inputAuthCode = '',
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
    this.emailAddress = '',
    this.authMethod = AuthMethod.phone,
  });

  const AuthCodeState.initial() : this._();

  AuthCodeState copyWith({
    String? phoneNumber,
    int? codeCountDown,
    String? verificationId,
    PhoneAuthCredential? credential,
    AuthProcedure? authProcedure,
    String? validAuthCode,
    String? emailAddress,
    String? inputAuthCode,
    AuthenticationError? error,
    AuthStatus? authStatus,
    bool? isValidPhoneNumber,
    AuthMethod? authMethod,
  }) {
    return AuthCodeState(
        phoneNumber: phoneNumber ?? this.phoneNumber,
        codeCountDown: codeCountDown ?? this.codeCountDown,
        verificationId: verificationId ?? this.verificationId,
        credential: credential ?? this.credential,
        authProcedure: authProcedure ?? this.authProcedure,
        inputAuthCode: inputAuthCode ?? this.inputAuthCode,
        error: error ?? this.error,
        authStatus: authStatus ?? this.authStatus,
        emailAddress: emailAddress ?? this.emailAddress,
        authMethod: authMethod ?? this.authMethod);
  }

  final String phoneNumber;
  final String emailAddress;
  final String verificationId;
  final PhoneAuthCredential? credential;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;
  final String inputAuthCode;
  final AuthenticationError error;
  final AuthStatus authStatus;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        phoneNumber,
        verificationId,
        credential,
        inputAuthCode,
        error,
        authProcedure,
        authStatus,
        codeCountDown,
        authMethod,
      ];
}
