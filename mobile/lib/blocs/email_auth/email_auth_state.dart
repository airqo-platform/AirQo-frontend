part of 'email_auth_bloc.dart';

enum EmailAuthStatus {
  initial,
  error,
  invalidEmailAddress,
  emailAddressDoesNotExist,
  emailAddressTaken,
  verificationCodeSent,
  success;
}

class EmailAuthState extends Equatable {
  const EmailAuthState({
    this.emailAddress = '',
    this.errorMessage = '',
    this.authProcedure = AuthProcedure.login,
    this.status = EmailAuthStatus.initial,
    this.emailAuthModel,
    this.loading = false,
  });

  EmailAuthState copyWith({
    String? emailAddress,
    String? errorMessage,
    AuthProcedure? authProcedure,
    EmailAuthStatus? status,
    EmailAuthModel? emailAuthModel,
    bool? loading,
  }) {
    return EmailAuthState(
      emailAddress: emailAddress ?? this.emailAddress,
      errorMessage: errorMessage ?? '',
      authProcedure: authProcedure ?? this.authProcedure,
      status: status ?? this.status,
      emailAuthModel: emailAuthModel ?? this.emailAuthModel,
      loading: loading ?? false,
    );
  }

  final String emailAddress;
  final String errorMessage;
  final AuthProcedure authProcedure;
  final EmailAuthStatus status;
  final bool loading;
  final EmailAuthModel? emailAuthModel;

  @override
  List<Object?> get props => [
        emailAddress,
        authProcedure,
        status,
        loading,
        emailAuthModel,
        errorMessage,
      ];
}
