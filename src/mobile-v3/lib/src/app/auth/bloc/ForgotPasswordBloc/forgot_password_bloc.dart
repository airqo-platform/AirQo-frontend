import 'package:flutter_bloc/flutter_bloc.dart';
import '../../repository/auth_repository.dart';
import 'forgot_password_event.dart';
import 'forgot_password_state.dart';


class PasswordResetBloc extends Bloc<PasswordResetEvent, PasswordResetState> {
  final AuthRepository authRepository;

  PasswordResetBloc({required this.authRepository}) : super(PasswordResetInitial()) {
    on<RequestPasswordReset>((event, emit) async {
      try {
        emit(PasswordResetLoading(email: event.email));
        await authRepository.requestPasswordReset(event.email);
        emit(PasswordResetSuccess(message: '',email: event.email ));
      } catch (e) {
        emit(PasswordResetError(message: e.toString()));
      }
    });

    on<UpdatePassword>((event, emit) async {
      emit(PasswordResetLoading());
      try {
        final message = await authRepository.updatePassword(
          confirmPassword: event.confirmPassword,
          password: event.password,
          token: event.token,
        );
        emit(PasswordResetSuccess(message: message));
      } catch (error) {
        emit(PasswordResetError(message: 'Failed to update password. \nPlease re-check the code you entered'));
      }
    });

    on<VerifyResetCodeEvent>((event, emit) async {
      emit(const PasswordResetLoading());

      try {

        if (RegExp(r'^\d{5}$').hasMatch(event.pin)) { // Replace with actual logic
          emit(const PasswordResetVerified(
            message: "PIN successfully verified. Proceed to reset password.",
          ));
        } else {
          emit(const PasswordResetError(
            message: "Invalid PIN. Please try again.",
          ));
        }
      } catch (e) {
        emit(const PasswordResetError(
          message: "Failed to verify PIN.",
        ));
      }
    });

  }
}
