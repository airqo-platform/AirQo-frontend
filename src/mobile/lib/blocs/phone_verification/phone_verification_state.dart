part of 'phone_verification_bloc.dart';

class PhoneVerificationState extends Equatable {
  const PhoneVerificationState(
    this.phoneAuthModel,
    this.authProcedure, {
    this.status = AuthenticationStatus.initial,
    this.codeCountDown = 5,
  });

  PhoneVerificationState copyWith({
    AuthenticationStatus? status,
    int? codeCountDown,
  }) {
    return PhoneVerificationState(
      phoneAuthModel,
      authProcedure,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      status: status ?? this.status,
    );
  }

  final AuthProcedure authProcedure;
  final AuthenticationStatus status;
  final PhoneAuthModel phoneAuthModel;
  final int codeCountDown;

  @override
  List<Object?> get props => [
        authProcedure,
        status,
        phoneAuthModel,
        codeCountDown,
      ];
}
