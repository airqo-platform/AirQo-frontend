part of 'email_auth_bloc.dart';

class EmailAuthState extends Equatable {
  const EmailAuthState._({
    this.emailAddress = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.blocStatus = BlocStatus.initial,
  });

  const EmailAuthState({
    this.emailAddress = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.blocStatus = BlocStatus.initial,
  });

  const EmailAuthState.initial(
      {String? emailAddress, required AuthProcedure authProcedure})
      : this._(
          blocStatus: BlocStatus.initial,
          emailAddress: emailAddress ?? '',
          authProcedure: authProcedure,
        );

  const EmailAuthState.verificationRequest()
      : this._(blocStatus: BlocStatus.processing);

  const EmailAuthState.verifying() : this._(blocStatus: BlocStatus.processing);

  const EmailAuthState.error(AuthenticationError error)
      : this._(error: error, blocStatus: BlocStatus.error);

  const EmailAuthState.verificationSuccessful()
      : this._(blocStatus: BlocStatus.success);

  EmailAuthState copyWith({
    String? emailAddress,
    AuthProcedure? authProcedure,
    AuthenticationError? error,
    BlocStatus? blocStatus,
  }) {
    return EmailAuthState(
      emailAddress: emailAddress ?? this.emailAddress,
      authProcedure: authProcedure ?? this.authProcedure,
      error: error ?? this.error,
      blocStatus: blocStatus ?? this.blocStatus,
    );
  }

  final String emailAddress;
  final AuthProcedure authProcedure;
  final AuthenticationError error;
  final BlocStatus blocStatus;

  @override
  List<Object?> get props => [
        emailAddress,
        error,
        authProcedure,
        blocStatus,
      ];
}
