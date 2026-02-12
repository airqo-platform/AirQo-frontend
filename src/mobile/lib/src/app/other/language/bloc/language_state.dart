part of 'language_bloc.dart';

abstract class LanguageState extends Equatable {
  const LanguageState();
  
  @override
  List<Object> get props => [];
}

class LanguageInitial extends LanguageState {}

class LanguageLoaded extends LanguageState {
  final String languageCode;
  final String languageName;
  final Locale locale;

  const LanguageLoaded({
    required this.languageCode,
    required this.languageName,
    required this.locale,
  });

  @override
  List<Object> get props => [languageCode, languageName, locale];
}

class LanguageError extends LanguageState {
  final String message;

  const LanguageError(this.message);

  @override
  List<Object> get props => [message];
}