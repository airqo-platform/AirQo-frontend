import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';

/// A drop-in replacement for [Tooltip] that automatically translates [message]
/// using the appropriate backend:
/// - Luganda → Sunbird AI
/// - Swahili, French → Google ML Kit (on-device, free)
///
/// Use [tooltipKey] instead of [key] when you need a [GlobalKey<TooltipState>]
/// to programmatically show/hide the tooltip.
class TranslatedTooltip extends StatefulWidget {
  final String message;
  final Widget child;
  final GlobalKey? tooltipKey;
  final TooltipTriggerMode? triggerMode;
  final bool? preferBelow;
  final double? verticalOffset;
  final Duration? showDuration;
  final Decoration? decoration;
  final TextStyle? textStyle;
  final EdgeInsetsGeometry? margin;

  const TranslatedTooltip({
    super.key,
    required this.message,
    required this.child,
    this.tooltipKey,
    this.triggerMode,
    this.preferBelow,
    this.verticalOffset,
    this.showDuration,
    this.decoration,
    this.textStyle,
    this.margin,
  });

  @override
  State<TranslatedTooltip> createState() => _TranslatedTooltipState();
}

class _TranslatedTooltipState extends State<TranslatedTooltip> {
  String _translatedMessage = '';
  String? _lastLocale;
  String? _lastSourceMessage;

  @override
  void initState() {
    super.initState();
    _translatedMessage = widget.message;
  }

  void _translate(String localeCode) {
    final isSunbird =
        SunbirdTranslationService().supportsTranslation(localeCode);
    final isMlKit = MlKitTranslationService().supportsTranslation(localeCode);

    if (!isSunbird && !isMlKit) {
      if (_translatedMessage != widget.message) {
        setState(() => _translatedMessage = widget.message);
      }
      return;
    }

    final requestLocale = localeCode;
    final future = isSunbird
        ? SunbirdTranslationService()
            .translate(widget.message, targetLocale: localeCode)
        : MlKitTranslationService()
            .translate(widget.message, targetLocale: localeCode);

    future.then((result) {
      if (mounted &&
          requestLocale == _lastLocale &&
          _translatedMessage != result) {
        setState(() => _translatedMessage = result);
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
        final messageChanged = widget.message != _lastSourceMessage;

        if (localeChanged || messageChanged) {
          _lastLocale = localeCode;
          _lastSourceMessage = widget.message;
          _translatedMessage = widget.message;
          _translate(localeCode);
        }

        return Tooltip(
          key: widget.tooltipKey,
          message: _translatedMessage,
          triggerMode: widget.triggerMode,
          preferBelow: widget.preferBelow,
          verticalOffset: widget.verticalOffset,
          showDuration: widget.showDuration,
          decoration: widget.decoration,
          textStyle: widget.textStyle,
          margin: widget.margin,
          child: widget.child,
        );
      },
    );
  }
}
