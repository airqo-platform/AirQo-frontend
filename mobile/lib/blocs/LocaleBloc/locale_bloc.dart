import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:hydrated_bloc/hydrated_bloc.dart';
// import 'dart:async';
import 'package:equatable/equatable.dart';
import 'dart:ui';

part 'locale_event.dart';
part 'locale_state.dart';

class LocaleBloc extends Bloc<LocaleEvent, LocaleState> {
  LocaleBloc(LocaleState localeState) : super(LocaleState.initial()) {
    on<LoadLanguage>((event, emit) {
      emit(state.copyWith(locale: event.locale));
    });
  }
  LocaleState get initialState => LocaleState.initial();

  // Stream<LocaleState> mapEventToState(
  //   LocaleEvent event,
  // ) async* {
  //   if (event is LoadLanguage) {
  //     yield LocaleState(locale: event.locale);
  //   }
  // }
}
