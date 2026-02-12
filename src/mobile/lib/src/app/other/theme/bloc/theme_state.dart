part of 'theme_bloc.dart';

sealed class ThemeState extends Equatable {
  const ThemeState();
  
  @override
  List<Object> get props => [];
}

final class ThemeInitial extends ThemeState {}

final class ThemeDark extends ThemeState{}

final class ThemeLight extends ThemeState{}
