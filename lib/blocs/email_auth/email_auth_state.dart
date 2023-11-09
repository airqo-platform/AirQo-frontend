part of 'email_auth_bloc.dart';

class EmailAuthState extends Equatable {
  const EmailAuthState({
    this.errorMessage = '',
    this.authProcedure = AuthProcedure.login,
    this.status = AuthenticationStatus.initial,
  });

  EmailAuthState copyWith({
    String? errorMessage,
    AuthProcedure? authProcedure,
    AuthenticationStatus? status,
  }) {
    return EmailAuthState(
      errorMessage: errorMessage ?? '',
      authProcedure: authProcedure ?? this.authProcedure,
      status: status ?? this.status,
    );
  }

  final String errorMessage;
  final AuthProcedure authProcedure;
  final AuthenticationStatus status;

  @override
  List<Object?> get props => [
        authProcedure,
        status,
        errorMessage,
      ];
}
