import 'package:airqo/src/app/shared/repository/hive_repository.dart';

abstract class ThemeRepository {
  Future<String> getTheme(bool switchTheme);
}

class ThemeImpl extends ThemeRepository {
  @override
  Future<String> getTheme(bool switchTheme) async {
    String theme = await HiveRepository.getData("theme", "themeBox") ?? "light";

    if (switchTheme) {
      if (theme == "light") {
        await HiveRepository.saveData("themeBox", "theme", "dark");
      } else {
        await HiveRepository.saveData("themeBox", "theme", "light");
      }

      String newTheme = await HiveRepository.getData("theme", "themeBox");
      return newTheme;
    }

    return theme;
  }
}
