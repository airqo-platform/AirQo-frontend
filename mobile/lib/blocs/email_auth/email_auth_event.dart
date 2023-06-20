part of 'email_auth_bloc.dart';

abstract class EmailAuthEvent extends Equatable {
  const EmailAuthEvent();
}

class InitializeEmailAuth extends EmailAuthEvent {
  const InitializeEmailAuth({
    required this.authProcedure,
  });
  final AuthProcedure authProcedure;

  @override
  List<Object> get props => [authProcedure];
}

class SetEmailAuthStatus extends EmailAuthEvent {
  const SetEmailAuthStatus(this.status, {this.errorMessage});

  final AuthenticationStatus status;
  final String? errorMessage;

  @override
  List<Object?> get props => [
        status,
        errorMessage,
      ];
}
