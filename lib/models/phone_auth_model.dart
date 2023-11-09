import 'package:firebase_auth/firebase_auth.dart';

class PhoneAuthModel {
  PhoneAuthModel(
    this.phoneNumber, {
    this.verificationId,
    this.phoneAuthCredential,
    this.resendToken,
  });

  PhoneAuthModel copyWith({
    String? verificationId,
    PhoneAuthCredential? phoneAuthCredential,
    int? resendToken,
    String? phoneNumber,
  }) {
    return PhoneAuthModel(
      phoneNumber ?? this.phoneNumber,
      verificationId: verificationId ?? this.verificationId,
      phoneAuthCredential: phoneAuthCredential ?? this.phoneAuthCredential,
      resendToken: resendToken ?? this.resendToken,
    );
  }

  final String? verificationId;
  final String phoneNumber;
  final int? resendToken;
  final PhoneAuthCredential? phoneAuthCredential;
}
