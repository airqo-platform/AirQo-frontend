part of 'theme_bloc.dart';

sealed class ThemeEvent extends Equatable {
  const ThemeEvent();

  @override
  List<Object> get props => [];
}

final class ToggleTheme extends ThemeEvent {
  final bool switchTheme;

  const ToggleTheme(this.switchTheme);
}
