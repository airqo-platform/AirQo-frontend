part of 'email_verification_bloc.dart';

class EmailVerificationState extends Equatable {
  const EmailVerificationState(
    this.emailAuthModel,
    this.authProcedure, {
    this.status = AuthenticationStatus.initial,
    this.codeCountDown = 5,
  });

  EmailVerificationState copyWith({
    AuthenticationStatus? status,
    int? codeCountDown,
  }) {
    return EmailVerificationState(
      emailAuthModel,
      authProcedure,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      status: status ?? this.status,
    );
  }

  final AuthProcedure authProcedure;
  final AuthenticationStatus status;
  final EmailAuthModel emailAuthModel;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        authProcedure,
        status,
        emailAuthModel,
        codeCountDown,
      ];
}
