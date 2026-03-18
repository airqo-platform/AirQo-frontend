import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';

/// A drop-in replacement for [Text] that automatically translates content
/// using Sunbird AI when a supported local language is selected.
/// Falls back to the original text for English or unsupported languages.
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

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode =
            state is LanguageLoaded ? state.languageCode : 'en';

        if (!SunbirdTranslationService().supportsTranslation(localeCode)) {
          return Text(
            text,
            style: style,
            textAlign: textAlign,
            maxLines: maxLines,
            overflow: overflow,
          );
        }

        return FutureBuilder<String>(
          future: SunbirdTranslationService()
              .translate(text, targetLocale: localeCode),
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
