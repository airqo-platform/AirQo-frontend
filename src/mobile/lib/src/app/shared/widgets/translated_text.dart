import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';

/// A drop-in replacement for [Text] that automatically translates content
/// using the appropriate backend:
/// - Luganda → Sunbird AI
/// - Swahili, French → Google ML Kit (on-device, free)
class TranslatedText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;

  const TranslatedText(
    this.text, {
    super.key,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
  });

  Future<String> _translate(String localeCode) {
    if (SunbirdTranslationService().supportsTranslation(localeCode)) {
      return SunbirdTranslationService()
          .translate(text, targetLocale: localeCode);
    }
    if (MlKitTranslationService().supportsTranslation(localeCode)) {
      return MlKitTranslationService()
          .translate(text, targetLocale: localeCode);
    }
    return Future.value(text);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode =
            state is LanguageLoaded ? state.languageCode : 'en';

        final isSupported =
            SunbirdTranslationService().supportsTranslation(localeCode) ||
            MlKitTranslationService().supportsTranslation(localeCode);

        if (!isSupported) {
          return Text(
            text,
            style: style,
            textAlign: textAlign,
            maxLines: maxLines,
            overflow: overflow,
          );
        }

        return FutureBuilder<String>(
          future: _translate(localeCode),
          builder: (context, snapshot) {
            return Text(
              snapshot.data ?? text,
              style: style,
              textAlign: textAlign,
              maxLines: maxLines,
              overflow: overflow,
            );
          },
        );
      },
    );
  }
}
