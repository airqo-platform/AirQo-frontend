part of 'auth_code_bloc.dart';

class AuthCodeState extends Equatable {
  const AuthCodeState._({
    this.emailAddress = '',
    this.phoneNumber = '',
    this.verificationId = '',
    this.phoneAuthCredential,
    this.authProcedure = AuthProcedure.login,
    this.inputAuthCode = '',
    this.error = AuthenticationError.none,
    this.authStatus = BlocStatus.initial,
    this.codeCountDown = 5,
    this.authMethod = AuthMethod.none,
    this.validAuthCode = '',
    this.validEmailLink = '',
  });

  const AuthCodeState({
    this.phoneNumber = '',
    this.codeCountDown = 5,
    this.verificationId = '',
    this.phoneAuthCredential,
    this.authProcedure = AuthProcedure.login,
    this.inputAuthCode = '',
    this.error = AuthenticationError.none,
    this.authStatus = BlocStatus.initial,
    this.emailAddress = '',
    this.authMethod = AuthMethod.none,
    this.validAuthCode = '',
    this.validEmailLink = '',
  });

  const AuthCodeState.initial() : this._();

  AuthCodeState copyWith({
    String? phoneNumber,
    int? codeCountDown,
    String? verificationId,
    PhoneAuthCredential? phoneAuthCredential,
    AuthProcedure? authProcedure,
    String? validAuthCode,
    String? emailAddress,
    String? inputAuthCode,
    AuthenticationError? error,
    BlocStatus? authStatus,
    bool? isValidPhoneNumber,
    AuthMethod? authMethod,
    String? validEmailLink,
  }) {
    return AuthCodeState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      verificationId: verificationId ?? this.verificationId,
      phoneAuthCredential: phoneAuthCredential ?? this.phoneAuthCredential,
      authProcedure: authProcedure ?? this.authProcedure,
      inputAuthCode: inputAuthCode ?? this.inputAuthCode,
      validAuthCode: validAuthCode ?? this.validAuthCode,
      error: error ?? this.error,
      authStatus: authStatus ?? this.authStatus,
      emailAddress: emailAddress ?? this.emailAddress,
      authMethod: authMethod ?? this.authMethod,
      validEmailLink: validEmailLink ?? this.validEmailLink,
    );
  }

  final String phoneNumber;
  final String emailAddress;
  final String verificationId;
  final String validEmailLink;
  final PhoneAuthCredential? phoneAuthCredential;
  final AuthProcedure authProcedure;
  final AuthMethod authMethod;
  final String inputAuthCode;
  final String validAuthCode;
  final AuthenticationError error;
  final BlocStatus authStatus;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        phoneNumber,
        verificationId,
        phoneAuthCredential,
        inputAuthCode,
        error,
        authProcedure,
        authStatus,
        codeCountDown,
        authMethod,
        validAuthCode,
        validEmailLink,
      ];
}
