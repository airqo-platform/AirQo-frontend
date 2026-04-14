import 'package:airqo/src/app/other/theme/repository/theme_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'theme_event.dart';
part 'theme_state.dart';

class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  final ThemeRepository themeRepository;

  ThemeBloc(this.themeRepository) : super(ThemeLight()) {
    on<ThemeEvent>((event, emit) async {
      if (event is ToggleTheme) {
        String theme = await themeRepository.getTheme(event.switchTheme);

        if (theme == "dark") {
          emit(ThemeDark());
        } else {
          emit(ThemeLight());
        }
      }
    });
  }
}
