import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'phone_auth_event.dart';
part 'phone_auth_state.dart';

class PhoneAuthBloc extends Bloc<PhoneAuthEvent, PhoneAuthState> {
  PhoneAuthBloc() : super(const PhoneAuthState()) {
    on<InitializePhoneAuth>(_onInitializePhoneAuth);
    on<SetPhoneAuthStatus>(_onSetPhoneAuthStatusStatus);
  }

  void _onSetPhoneAuthStatusStatus(
    SetPhoneAuthStatus event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(
      status: event.status,
      errorMessage: event.errorMessage,
    ));
  }

  void _onInitializePhoneAuth(
    InitializePhoneAuth event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(PhoneAuthState(
      authProcedure: event.authProcedure,
    ));
  }
}
