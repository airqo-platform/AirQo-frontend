part of 'locale_bloc.dart';

class LocaleState extends Equatable {
  final Locale locale;

  const LocaleState({required this.locale});
  factory LocaleState.initial() {
    return const LocaleState(locale: Locale('en'));
  }
  LocaleState copyWith({Locale? locale}) {
    return LocaleState(locale: locale ?? this.locale);
  }

  @override
  List<Object?> get props => [locale];
}

