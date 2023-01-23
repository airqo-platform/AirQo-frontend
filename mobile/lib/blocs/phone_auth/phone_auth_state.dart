part of 'phone_auth_bloc.dart';

class PhoneAuthState extends Equatable {
  const PhoneAuthState._({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.blocStatus = BlocStatus.initial,
  });

  const PhoneAuthState({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = AuthenticationError.none,
    this.blocStatus = BlocStatus.initial,
  });

  const PhoneAuthState.initial({
    String? phoneNumber,
    String? countryCode,
    required AuthProcedure authProcedure,
  }) : this._(
          blocStatus: BlocStatus.initial,
          countryCode: countryCode ?? '+256',
          phoneNumber: phoneNumber ?? '',
          authProcedure: authProcedure,
        );

  const PhoneAuthState.verificationRequest()
      : this._(blocStatus: BlocStatus.processing);

  const PhoneAuthState.verifying() : this._(blocStatus: BlocStatus.processing);

  const PhoneAuthState.error(AuthenticationError error)
      : this._(error: error, blocStatus: BlocStatus.error);

  const PhoneAuthState.verificationSuccessful()
      : this._(blocStatus: BlocStatus.success);

  PhoneAuthState copyWith({
    String? phoneNumber,
    String? countryCode,
    AuthProcedure? authProcedure,
    AuthenticationError? error,
    BlocStatus? blocStatus,
  }) {
    return PhoneAuthState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      countryCode: countryCode ?? this.countryCode,
      authProcedure: authProcedure ?? this.authProcedure,
      error: error ?? this.error,
      blocStatus: blocStatus ?? this.blocStatus,
    );
  }

  final String phoneNumber;
  final String countryCode;
  final AuthProcedure authProcedure;
  final AuthenticationError error;
  final BlocStatus blocStatus;

  @override
  List<Object?> get props => [
        phoneNumber,
        countryCode,
        error,
        authProcedure,
        blocStatus,
      ];
}
