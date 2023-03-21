import 'package:firebase_auth/firebase_auth.dart';

class PhoneAuthModel {
  PhoneAuthModel({
    this.verificationId,
    this.phoneAuthCredential,
    this.resendToken,
  });

  final String? verificationId;
  final int? resendToken;
  final PhoneAuthCredential? phoneAuthCredential;
}
