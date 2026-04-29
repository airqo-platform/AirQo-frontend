import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:loggy/loggy.dart';

abstract class AuthRepository with UiLoggy {
  Future<String> loginWithEmailAndPassword(String username, String password);
  Future<void> registerWithEmailAndPassword(RegisterInputModel model);
  Future<String> requestPasswordReset(String email);
  Future<String> updatePassword({
    required String token,
    required String password,
    required String confirmPassword,
  });
  Future<void> verifyEmailCode(String token, String email);
  Future<String> validatePinFormat(String pin, String email);
  Future<void> deleteUserAccount();
}
