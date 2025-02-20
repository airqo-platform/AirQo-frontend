import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'phone_verification_event.dart';
part 'phone_verification_state.dart';

class PhoneVerificationBloc
    extends Bloc<PhoneVerificationEvent, PhoneVerificationState> {
  PhoneVerificationBloc()
      : super(PhoneVerificationState(
          PhoneAuthModel(""),
          AuthProcedure.signup,
        )) {
    on<InitializePhoneVerification>(_onInitializeEmailAuth);
    on<SetPhoneVerificationStatus>(_onSetEmailAuthStatus);
    on<UpdatePhoneVerificationCountDown>(_onUpdateEmailVerificationCountDown);
  }

  void _onUpdateEmailVerificationCountDown(
    UpdatePhoneVerificationCountDown event,
    Emitter<PhoneVerificationState> emit,
  ) {
    return emit(state.copyWith(codeCountDown: event.countDown));
  }

  void _onSetEmailAuthStatus(
    SetPhoneVerificationStatus event,
    Emitter<PhoneVerificationState> emit,
  ) {
    return emit(state.copyWith(status: event.status));
  }

  void _onInitializeEmailAuth(
    InitializePhoneVerification event,
    Emitter<PhoneVerificationState> emit,
  ) {
    return emit(PhoneVerificationState(
      event.phoneAuthModel,
      event.authProcedure,
    ));
  }
}
