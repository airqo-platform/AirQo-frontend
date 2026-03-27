import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';

/// A drop-in replacement for [Text] that automatically translates content
/// using the appropriate backend:
/// - Luganda → Sunbird AI
/// - Swahili, French → Google ML Kit (on-device, free)
class TranslatedText extends StatefulWidget {
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
  State<TranslatedText> createState() => _TranslatedTextState();
}

class _TranslatedTextState extends State<TranslatedText> {
  String _displayed = '';
  String? _lastLocale;
  String? _lastSourceText;

  @override
  void initState() {
    super.initState();
    _displayed = widget.text;
  }

  void _translate(String localeCode) {
    final isSunbird =
        SunbirdTranslationService().supportsTranslation(localeCode);
    final isMlKit = MlKitTranslationService().supportsTranslation(localeCode);

    if (!isSunbird && !isMlKit) {
      if (_displayed != widget.text) setState(() => _displayed = widget.text);
      return;
    }

    final future = isSunbird
        ? SunbirdTranslationService()
            .translate(widget.text, targetLocale: localeCode)
        : MlKitTranslationService()
            .translate(widget.text, targetLocale: localeCode);

    future.then((result) {
      if (mounted && _displayed != result) {
        setState(() => _displayed = result);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode =
            state is LanguageLoaded ? state.languageCode : 'en';

        final localeChanged = localeCode != _lastLocale;
        final textChanged = widget.text != _lastSourceText;

        if (localeChanged || textChanged) {
          _lastLocale = localeCode;
          _lastSourceText = widget.text;
          _displayed = widget.text; // show original while translating
          _translate(localeCode);
        }

        return Text(
          _displayed,
          style: widget.style,
          textAlign: widget.textAlign,
          maxLines: widget.maxLines,
          overflow: widget.overflow,
        );
      },
    );
  }
}
