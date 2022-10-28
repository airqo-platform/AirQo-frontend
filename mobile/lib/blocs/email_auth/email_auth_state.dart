part of 'email_auth_bloc.dart';

class EmailAuthState extends Equatable {
  const EmailAuthState._({
    this.emailAddress = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
  });

  const EmailAuthState({
    this.emailAddress = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
  });

  const EmailAuthState.initial(
      {String? emailAddress, required AuthProcedure authProcedure})
      : this._(
          authStatus: AuthStatus.initial,
          emailAddress: emailAddress ?? '',
          authProcedure: authProcedure,
        );

  const EmailAuthState.verificationRequest()
      : this._(authStatus: AuthStatus.processing);

  const EmailAuthState.verifying() : this._(authStatus: AuthStatus.processing);

  const EmailAuthState.error(AuthenticationError error)
      : this._(error: error, authStatus: AuthStatus.error);

  const EmailAuthState.verificationSuccessful()
      : this._(authStatus: AuthStatus.success);

  EmailAuthState copyWith({
    String? emailAddress,
    AuthProcedure? authProcedure,
    AuthenticationError? error,
    AuthStatus? authStatus,
  }) {
    return EmailAuthState(
      emailAddress: emailAddress ?? this.emailAddress,
      authProcedure: authProcedure ?? this.authProcedure,
      error: error ?? this.error,
      authStatus: authStatus ?? this.authStatus,
    );
  }

  final String emailAddress;
  final AuthProcedure authProcedure;
  final AuthenticationError error;
  final AuthStatus authStatus;

  @override
  List<Object?> get props => [
        emailAddress,
        error,
        authProcedure,
        authStatus,
      ];
}
