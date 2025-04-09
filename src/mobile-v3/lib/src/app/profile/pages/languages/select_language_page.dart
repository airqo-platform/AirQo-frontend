import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/other/language/services/app_localizations.dart';

class LanguageOption {
  final String code;
  final String name;
  final String nativeName;

  LanguageOption({
    required this.code,
    required this.name,
    required this.nativeName,
  });
}

class SelectLanguagePage extends StatefulWidget {
  const SelectLanguagePage({super.key});

  @override
  State<SelectLanguagePage> createState() => _SelectLanguagePageState();
}

class _SelectLanguagePageState extends State<SelectLanguagePage> {
  final List<LanguageOption> languages = [
    LanguageOption(code: 'en', name: 'English', nativeName: 'English'),
    LanguageOption(code: 'fr', name: 'French', nativeName: 'Français'),
    LanguageOption(code: 'sw', name: 'Swahili', nativeName: 'Kiswahili'),
    LanguageOption(code: 'lg', name: 'Luganda', nativeName: 'Luganda'),
    LanguageOption(code: 'pt', name: 'Portuguese', nativeName: 'Português'),
  ];

  void _showLanguageChangeNotification(
      BuildContext context, LanguageOption language) {
    //final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.language_rounded,
              color: Colors.white,
              size: 24,
            ),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    AppLocalizations.of(context)
                        .translate('Language changed to'),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    language.name,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.primaryColor.withOpacity(0.9),
        behavior: SnackBarBehavior.floating,
        margin: EdgeInsets.all(16),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: Duration(seconds: 3),
        elevation: 6,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final dividerColor =
        isDarkMode ? AppColors.dividerColordark : AppColors.dividerColorlight;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context).translate('language.select_language'),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w500,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<LanguageBloc, LanguageState>(
        builder: (context, state) {
          String currentLanguageCode = 'en';

          if (state is LanguageLoaded) {
            currentLanguageCode = state.languageCode;
          }

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ListView.separated(
              itemCount: languages.length,
              separatorBuilder: (context, index) => Divider(
                color: dividerColor,
                height: 1,
              ),
              itemBuilder: (context, index) {
                final language = languages[index];
                final isSelected = language.code == currentLanguageCode;

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  title: Text(
                    language.name,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w400,
                      color: isDarkMode
                          ? AppColors.highlightColor2
                          : AppColors.boldHeadlineColor4,
                    ),
                  ),
                  subtitle: Text(
                    language.nativeName,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDarkMode ? Colors.grey : Colors.grey.shade700,
                    ),
                  ),
                  trailing: isSelected
                      ? Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 18,
                          ),
                        )
                      : Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isDarkMode
                                  ? AppColors.secondaryHeadlineColor2
                                  : AppColors.borderColor2,
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                  onTap: () {
                    context
                        .read<LanguageBloc>()
                        .add(ChangeLanguage(language.code));

                        _showLanguageChangeNotification(context, language);
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
