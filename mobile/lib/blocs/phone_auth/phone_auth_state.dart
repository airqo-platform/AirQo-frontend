part of 'phone_auth_bloc.dart';

enum PhoneBlocStatus {
  processing,
  initial,
  verificationSuccessful,
  autoVerifying,
  verificationCodeSent,
  error;
}

enum PhoneBlocError {
  none,
  invalidPhoneNumber,
  invalidCode,
  verificationFailed,
  phoneNumberTaken,
  noInternetConnection;
}

class PhoneAuthState extends Equatable {
  const PhoneAuthState._({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = PhoneBlocError.none,
    this.status = PhoneBlocStatus.initial,
    this.verificationId = '',
    this.errorMessage = '',
    this.authCredential,
    this.codeCountDown = 5,
    this.resendingToken,
    this.inputAuthCode = '',
  });

  const PhoneAuthState({
    this.phoneNumber = '',
    this.countryCode = '',
    this.authProcedure = AuthProcedure.login,
    this.error = PhoneBlocError.none,
    this.status = PhoneBlocStatus.initial,
    this.verificationId = '',
    this.errorMessage = '',
    this.authCredential,
    this.codeCountDown = 5,
    this.resendingToken,
    this.inputAuthCode = '',
  });

  const PhoneAuthState.initial({
    String? phoneNumber,
    String? countryCode,
    required AuthProcedure authProcedure,
  }) : this._(
          countryCode: countryCode ?? '+256',
          phoneNumber: phoneNumber ?? '',
          authProcedure: authProcedure,
        );

  PhoneAuthState copyWith({
    String? phoneNumber,
    String? countryCode,
    String? inputAuthCode,
    int? codeCountDown,
    AuthProcedure? authProcedure,
    PhoneBlocError? error,
    PhoneBlocStatus? status,
    String? verificationId,
    String? errorMessage,
    PhoneAuthCredential? authCredential,
    int? resendingToken,
  }) {
    return PhoneAuthState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      countryCode: countryCode ?? this.countryCode,
      authProcedure: authProcedure ?? this.authProcedure,
      codeCountDown: codeCountDown ?? this.codeCountDown,
      error: error ?? this.error,
      status: status ?? this.status,
      verificationId: verificationId ?? this.verificationId,
      authCredential: authCredential ?? this.authCredential,
      resendingToken: resendingToken ?? this.resendingToken,
      errorMessage: errorMessage ?? this.errorMessage,
      inputAuthCode: inputAuthCode ?? this.inputAuthCode,
    );
  }

  final String phoneNumber;
  final String countryCode;
  final AuthProcedure authProcedure;
  final PhoneBlocError error;
  final PhoneBlocStatus status;
  final String verificationId;
  final PhoneAuthCredential? authCredential;
  final String errorMessage;
  final int? resendingToken;
  final String inputAuthCode;
  final int codeCountDown;

  String fullPhoneNumber() {
    return "$countryCode $phoneNumber";
  }

  @override
  List<Object?> get props => [
        phoneNumber,
        countryCode,
        error,
        authProcedure,
        status,
        authCredential,
        verificationId,
        resendingToken,
        inputAuthCode,
        codeCountDown,
      ];
}
