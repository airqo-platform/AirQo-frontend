part of 'email_auth_bloc.dart';

enum EmailBlocStatus {
  processing,
  initial,
  verificationSuccessful,
  verificationCodeSent,
  error;
}

enum EmailBlocError {
  none,
  invalidEmailAddress,
  invalidCode,
  verificationFailed,
  emailTaken,
  noInternetConnection;
}

class EmailAuthState extends Equatable {
  const EmailAuthState._({
    this.emailAddress = '',
    this.errorMessage = '',
    this.validAuthCode = '',
    this.verificationLink = '',
    this.inputAuthCode = '',
    this.codeCountDown = 5,
    this.authProcedure = AuthProcedure.login,
    this.error = EmailBlocError.none,
    this.status = EmailBlocStatus.initial,
  });

  const EmailAuthState({
    this.emailAddress = '',
    this.errorMessage = '',
    this.validAuthCode = '',
    this.verificationLink = '',
    this.codeCountDown = 5,
    this.inputAuthCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = EmailBlocError.none,
    this.status = EmailBlocStatus.initial,
  });

  const EmailAuthState.initial({
    String? emailAddress,
    required AuthProcedure authProcedure,
  }) : this._(
          status: EmailBlocStatus.initial,
          emailAddress: emailAddress ?? '',
          authProcedure: authProcedure,
        );

  EmailAuthState copyWith({
    String? emailAddress,
    String? verificationLink,
    String? validAuthCode,
    String? inputAuthCode,
    AuthProcedure? authProcedure,
    EmailBlocError? error,
    EmailBlocStatus? status,
    String? errorMessage,
    int? codeCountDown,
  }) {
    return EmailAuthState(
      emailAddress: emailAddress ?? this.emailAddress,
      verificationLink: verificationLink ?? this.verificationLink,
      validAuthCode: validAuthCode ?? this.validAuthCode,
      inputAuthCode: inputAuthCode ?? this.inputAuthCode,
      authProcedure: authProcedure ?? this.authProcedure,
      error: error ?? this.error,
      errorMessage: errorMessage ?? this.errorMessage,
      status: status ?? this.status,
      codeCountDown: codeCountDown ?? this.codeCountDown,
    );
  }

  final String emailAddress;
  final AuthProcedure authProcedure;
  final EmailBlocError error;
  final EmailBlocStatus status;
  final String verificationLink;
  final String validAuthCode;
  final String inputAuthCode;
  final String errorMessage;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        emailAddress,
        error,
        authProcedure,
        status,
        verificationLink,
        validAuthCode,
        errorMessage,
      ];
}
