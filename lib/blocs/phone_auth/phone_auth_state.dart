part of 'phone_auth_bloc.dart';

class PhoneAuthState extends Equatable {
  const PhoneAuthState({
    this.authProcedure = AuthProcedure.login,
    this.errorMessage = '',
    this.status = AuthenticationStatus.initial,
  });

  PhoneAuthState copyWith({
    String? errorMessage,
    AuthProcedure? authProcedure,
    AuthenticationStatus? status,
  }) {
    return PhoneAuthState(
      authProcedure: authProcedure ?? this.authProcedure,
      errorMessage: errorMessage ?? '',
      status: status ?? this.status,
    );
  }

  final String errorMessage;
  final AuthProcedure authProcedure;
  final AuthenticationStatus status;

  @override
  List<Object?> get props => [
        errorMessage,
        authProcedure,
        status,
      ];
}
