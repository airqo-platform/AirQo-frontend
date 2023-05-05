part of 'email_auth_bloc.dart';

enum EmailAuthStatus {
  initial,
  invalidEmailAddress,
  emailAddressDoesNotExist,
  emailAddressTaken,
  authCodeSent,
  invalidAuthCode,
  success;
}

class EmailAuthState extends Equatable {
  const EmailAuthState({
    required this.emailAddress,
    required this.errorMessage,
    required this.authProcedure,
    required this.status,
    required this.emailAuthModel,
    required this.codeCountDown,
  });

  factory EmailAuthState.initial() => EmailAuthState(
        emailAddress: '',
        errorMessage: '',
        authProcedure: AuthProcedure.login,
        status: EmailAuthStatus.initial,
        emailAuthModel: EmailAuthModel.initial(),
        codeCountDown: 0,
      );

  EmailAuthState copyWith({
    String? emailAddress,
    String? errorMessage,
    AuthProcedure? authProcedure,
    EmailAuthStatus? status,
    EmailAuthModel? emailAuthModel,
    bool? loading,
    int? codeCountDown,
  }) {
    return EmailAuthState(
      emailAddress: emailAddress ?? this.emailAddress,
      errorMessage: errorMessage ?? '',
      authProcedure: authProcedure ?? this.authProcedure,
      status: status ?? this.status,
      emailAuthModel: emailAuthModel ?? this.emailAuthModel,
      codeCountDown: codeCountDown ?? this.codeCountDown,
    );
  }

  final String emailAddress;
  final String errorMessage;
  final AuthProcedure authProcedure;
  final EmailAuthStatus status;
  final EmailAuthModel emailAuthModel;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        emailAddress,
        authProcedure,
        status,
        emailAuthModel,
        errorMessage,
        codeCountDown,
      ];
}
