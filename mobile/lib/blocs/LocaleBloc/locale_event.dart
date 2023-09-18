part of 'locale_bloc.dart';

abstract class LocaleEvent {}

class LoadLanguage extends LocaleEvent {
  final Locale locale;

  LoadLanguage(this.locale);
}


