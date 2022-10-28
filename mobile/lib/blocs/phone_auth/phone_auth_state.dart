part of 'phone_auth_bloc.dart';

class PhoneAuthState extends Equatable {
  const PhoneAuthState._({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
    this.isValidPhoneNumber = false,
  });

  const PhoneAuthState({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.authStatus = AuthStatus.initial,
    this.isValidPhoneNumber = false,
  });

  const PhoneAuthState.initial(
      {String? phoneNumber,
      String? countryCode,
      required AuthProcedure authProcedure})
      : this._(
          authStatus: AuthStatus.initial,
          countryCode: countryCode ?? '+256',
          phoneNumber: phoneNumber ?? '',
          authProcedure: authProcedure,
        );

  const PhoneAuthState.verificationRequest()
      : this._(authStatus: AuthStatus.processing);

  const PhoneAuthState.verifying() : this._(authStatus: AuthStatus.processing);

  const PhoneAuthState.error(AuthenticationError error)
      : this._(error: error, authStatus: AuthStatus.error);

  const PhoneAuthState.verificationSuccessful()
      : this._(authStatus: AuthStatus.success);

  PhoneAuthState copyWith({
    String? phoneNumber,
    String? countryCode,
    String? verificationId,
    PhoneAuthCredential? credential,
    AuthProcedure? authProcedure,
    String? validAuthCode,
    List<String>? inputAuthCode,
    AuthenticationError? error,
    AuthStatus? authStatus,
    bool? isValidPhoneNumber,
  }) {
    return PhoneAuthState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      countryCode: countryCode ?? this.countryCode,
      authProcedure: authProcedure ?? this.authProcedure,
      error: error ?? this.error,
      authStatus: authStatus ?? this.authStatus,
      isValidPhoneNumber: isValidPhoneNumber ?? this.isValidPhoneNumber,
    );
  }

  final String phoneNumber;
  final String countryCode;
  final AuthProcedure authProcedure;
  final AuthenticationError error;
  final AuthStatus authStatus;
  final bool isValidPhoneNumber;

  @override
  List<Object?> get props => [
        phoneNumber,
        countryCode,
        error,
        authProcedure,
        authStatus,
        isValidPhoneNumber
      ];
}
