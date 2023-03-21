import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'phone_auth_event.dart';
part 'phone_auth_state.dart';

class PhoneAuthBloc extends Bloc<PhoneAuthEvent, PhoneAuthState> {
  final AirqoApiClient apiClient;
  PhoneAuthBloc(this.apiClient) : super(const PhoneAuthState()) {
    on<InitializePhoneAuth>(_onInitializePhoneAuth);
    on<UpdateCountryCode>(_onUpdateCountryCode);
    on<UpdatePhoneNumber>(_onUpdatePhoneNumber);
    on<ClearPhoneNumberEvent>(_onClearPhoneNumberEvent);
    on<UpdateStatus>(_onUpdateStatus);
    on<UpdatePhoneAuthModel>(_onUpdatePhoneAuthModel);
  }

  void _onUpdatePhoneAuthModel(
    UpdatePhoneAuthModel event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(phoneAuthModel: event.phoneAuthModel));
  }

  void _onUpdateCountryCode(
    UpdateCountryCode event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(countryCode: event.code));
  }

  void _onUpdatePhoneNumber(
    UpdatePhoneNumber event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(phoneNumber: event.phoneNumber));
  }

  void _onClearPhoneNumberEvent(
    ClearPhoneNumberEvent _,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(PhoneAuthState(authProcedure: state.authProcedure));
  }

  void _onUpdateStatus(
    UpdateStatus event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(state.copyWith(
      status: event.status,
      loading: event.loading,
      errorMessage: event.errorMessage,
    ));
  }

  void _onInitializePhoneAuth(
    InitializePhoneAuth event,
    Emitter<PhoneAuthState> emit,
  ) {
    return emit(PhoneAuthState(
      authProcedure: event.authProcedure,
      phoneNumber: event.phoneNumber,
    ));
  }
}
