import 'package:app/other/lib/repositories/auth_repository.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'signup_state.dart';

class SignupCubit extends Cubit<SignupState> {
  final AuthRepository _authRepository;

  SignupCubit(this._authRepository) : super(SignupState.initial());

  void emailChanged(String value) {
    emit(
      state.copyWith(
        email: value,
        status: SignupStatus.initial,
      ),
    );
  }

  void passwordChanged(String value) {
    emit(
      state.copyWith(
        password: value,
        status: SignupStatus.initial,
      ),
    );
  }

  Future<void> signupFormSubmitted() async {
    if (state.status == SignupStatus.submitting) return;
    emit(state.copyWith(status: SignupStatus.submitting));
    try {
      await _authRepository.signup(
        email: state.email,
        password: state.password,
      );
      emit(state.copyWith(status: SignupStatus.success));
    } catch (_) {}
  }
}
