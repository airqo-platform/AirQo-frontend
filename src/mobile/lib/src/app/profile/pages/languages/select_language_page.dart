import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';

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
    LanguageOption(code: 'lg', name: 'Luganda', nativeName: 'Luganda'),
    LanguageOption(code: 'sw', name: 'Swahili', nativeName: 'Kiswahili'),
    LanguageOption(code: 'fr', name: 'French', nativeName: 'Français'),
  ];

  String? _preparingCode;

  Future<void> _selectLanguage(
      BuildContext context, LanguageOption language) async {
    if (_preparingCode != null) return;

    final needsMlKitDownload =
        MlKitTranslationService().supportsTranslation(language.code) &&
            !MlKitTranslationService().isModelReady(language.code);
    final needsSunbirdPrepare =
        SunbirdTranslationService().supportsTranslation(language.code);
    final needsPrepare = needsMlKitDownload || needsSunbirdPrepare;

    // Capture context-dependent references before any await.
    final bloc = context.read<LanguageBloc>();
    final messenger = ScaffoldMessenger.of(context);

    if (!needsPrepare) {
      bloc.add(ChangeLanguage(language.code));
      _showLanguageChangeNotification(messenger, language);
      return;
    }

    setState(() => _preparingCode = language.code);
    try {
      if (needsMlKitDownload) {
        await MlKitTranslationService().prepareModel(language.code);
      }
      if (needsSunbirdPrepare) {
        await SunbirdTranslationService().prepare(targetLocale: language.code);
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _preparingCode = null);
      messenger.showSnackBar(
        SnackBar(
          content: const Text('Failed to prepare language. Please try again.'),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    if (!mounted) return;
    setState(() => _preparingCode = null);
    bloc.add(ChangeLanguage(language.code));
    _showLanguageChangeNotification(messenger, language);
  }

  void _showLanguageChangeNotification(
      ScaffoldMessengerState messenger, LanguageOption language) {
    messenger.showSnackBar(
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
                    'Language changed to',
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
    final backgroundColor =
        isDarkMode ? AppColors.darkThemeBackground : AppColors.backgroundColor;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: backgroundColor,
        elevation: 0,
        title: TranslatedText(
          'Select Language',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w500,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: BlocBuilder<LanguageBloc, LanguageState>(
        builder: (context, state) {
          String currentLanguageCode = 'en';

          if (state is LanguageLoaded) {
            currentLanguageCode = state.languageCode;
          }

          final hasUndownloadedMlKitLanguage = languages.any(
            (l) =>
                MlKitTranslationService().supportsTranslation(l.code) &&
                !MlKitTranslationService().isModelReady(l.code),
          );

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    itemCount: languages.length,
                    separatorBuilder: (context, index) => Divider(
                      color: dividerColor,
                      height: 1,
                    ),
                    itemBuilder: (context, index) {
                      final language = languages[index];
                      final isSelected = language.code == currentLanguageCode;
                      final isPreparing = _preparingCode == language.code;

                      return ListTile(
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 12),
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
                          isPreparing
                              ? 'Preparing translation...'
                              : language.nativeName,
                          style: TextStyle(
                            fontSize: 14,
                            color: isPreparing
                                ? AppColors.primaryColor
                                : isDarkMode
                                    ? Colors.grey
                                    : Colors.grey.shade700,
                          ),
                        ),
                        trailing: isPreparing
                            ? SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: AppColors.primaryColor,
                          ),
                        )
                      : isSelected
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
                        onTap: _preparingCode != null
                            ? null
                            : () => _selectLanguage(context, language),
                      );
                    },
                  ),
                ),
                if (hasUndownloadedMlKitLanguage)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 14,
                          color: isDarkMode
                              ? Colors.grey
                              : Colors.grey.shade600,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Some languages download a small pack on first use.',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDarkMode
                                  ? Colors.grey
                                  : Colors.grey.shade600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
