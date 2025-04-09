import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'language_event.dart';
part 'language_state.dart';

class LanguageBloc extends Bloc<LanguageEvent, LanguageState> {
  LanguageBloc() : super(LanguageInitial()) {
    on<LoadLanguage>(_onLoadLanguage);
    on<ChangeLanguage>(_onChangeLanguage);
  }

  Future<void> _onLoadLanguage(LoadLanguage event, Emitter<LanguageState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final languageCode = prefs.getString('languageCode') ?? 'en';
      final languageName = _getLanguageName(languageCode);
      
      emit(LanguageLoaded(
        languageCode: languageCode,
        languageName: languageName,
        locale: Locale(languageCode),
      ));
    } catch (e) {
      emit(LanguageError('Failed to load language settings'));
    }
  }

  Future<void> _onChangeLanguage(ChangeLanguage event, Emitter<LanguageState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('languageCode', event.languageCode);
      
      final languageName = _getLanguageName(event.languageCode);
      
      emit(LanguageLoaded(
        languageCode: event.languageCode,
        languageName: languageName,
        locale: Locale(event.languageCode),
      ));
    } catch (e) {
      emit(LanguageError('Failed to change language'));
    }
  }
  
  String _getLanguageName(String languageCode) {
    switch (languageCode) {
      case 'en': return 'English';
      case 'fr': return 'French';
      case 'sw': return 'Swahili';
      case 'lg': return 'Luganda';
      case 'pt': return 'Portuguese';
      default: return 'English';
    }
  }
}