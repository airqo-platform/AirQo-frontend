part of 'phone_auth_bloc.dart';

enum PhoneAuthStatus {
  initial,
  error,
  invalidPhoneNumber,
  phoneNumberDoesNotExist,
  phoneNumberTaken,
  verificationCodeSent,
  success;
}

class PhoneAuthState extends Equatable {
  const PhoneAuthState({
    this.phoneNumber = '',
    this.countryCode = '+256',
    this.authProcedure = AuthProcedure.login,
    this.errorMessage = '',
    this.status = PhoneAuthStatus.initial,
    this.phoneAuthModel,
    this.loading = false,
  });

  PhoneAuthState copyWith({
    String? phoneNumber,
    String? countryCode,
    String? errorMessage,
    AuthProcedure? authProcedure,
    PhoneAuthStatus? status,
    PhoneAuthModel? phoneAuthModel,
    bool? loading,
  }) {
    return PhoneAuthState(
      phoneNumber: phoneNumber ?? this.phoneNumber,
      countryCode: countryCode ?? this.countryCode,
      authProcedure: authProcedure ?? this.authProcedure,
      errorMessage: errorMessage ?? '',
      status: status ?? this.status,
      phoneAuthModel: phoneAuthModel ?? this.phoneAuthModel,
      loading: loading ?? false,
    );
  }

  final String phoneNumber;
  final String countryCode;
  final String errorMessage;
  final AuthProcedure authProcedure;
  final PhoneAuthStatus status;
  final bool loading;
  final PhoneAuthModel? phoneAuthModel;

  String get fullPhoneNumber => "$countryCode $phoneNumber";

  @override
  List<Object?> get props => [
        phoneNumber,
        countryCode,
        errorMessage,
        authProcedure,
        status,
        phoneAuthModel,
        loading,
      ];
}
