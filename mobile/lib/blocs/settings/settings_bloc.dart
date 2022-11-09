// import 'dart:async';
//
// import 'package:app/blocs/auth_code/auth_code_bloc.dart';
// import 'package:app/models/models.dart';
// import 'package:app/services/services.dart';
// import 'package:app/utils/utils.dart';
// import 'package:app/widgets/widgets.dart';
// import 'package:equatable/equatable.dart';
// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';
//
// part 'settings_event.dart';
// part 'settings_state.dart';
//
// class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
//   SettingsBloc() : super(SettingsState.initial()) {
//     on<AccountPreDeletionFailed>(_onAccountPreDeletionFailed);
//     on<AccountPreDeletionPassed>(_onAccountPreDeletionPassed);
//   }
//
//   Future<void> _onAccountPreDeletionFailed(
//     AccountPreDeletionFailed event,
//     Emitter<SettingsState> emit,
//   ) async {
//     return emit(state.copyWith(
//       blocStatus: BlocStatus.error,
//       error: event.authenticationError,
//     ));
//   }
//
//   Future<void> _onAccountPreDeletionPassed(
//     AccountPreDeletionPassed _,
//     Emitter<SettingsState> emit,
//   ) async {
//     return emit(state.copyWith(
//       blocStatus: BlocStatus.accountPreDeletionCheckSuccess,
//       error: AuthenticationError.none,
//     ));
//   }
// }
