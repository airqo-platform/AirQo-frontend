part of 'authentication_bloc.dart';

class AuthenticationState extends Equatable {
  const AuthenticationState({required this.authProcedure});
  final AuthProcedure authProcedure;
  final String phoneNumber;
  final String countryCode;
  final String authCode;

  @override
  List<Object?> get props => [authProcedure];
}
