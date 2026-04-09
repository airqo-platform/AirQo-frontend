import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class LocationSearchBar extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const LocationSearchBar({
    super.key,
    required this.controller,
    required this.onChanged,
  });

  @override
  State<LocationSearchBar> createState() => _LocationSearchBarState();
}

class _LocationSearchBarState extends State<LocationSearchBar> {
  static const _sourceHint = 'Search Villages, Cities or Countries';
  String _hint = _sourceHint;
  String? _lastLocale;

  void _translate(String localeCode) {
    final isSunbird = SunbirdTranslationService().supportsTranslation(localeCode);
    final isMlKit = MlKitTranslationService().supportsTranslation(localeCode);

    if (!isSunbird && !isMlKit) {
      if (_hint != _sourceHint) setState(() => _hint = _sourceHint);
      return;
    }

    final requestLocale = localeCode;
    final future = isSunbird
        ? SunbirdTranslationService().translate(_sourceHint, targetLocale: localeCode)
        : MlKitTranslationService().translate(_sourceHint, targetLocale: localeCode);

    future.then((result) {
      if (mounted && requestLocale == _lastLocale && _hint != result) {
        setState(() => _hint = result);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode = state is LanguageLoaded ? state.languageCode : 'en';

        if (localeCode != _lastLocale) {
          _lastLocale = localeCode;
          _hint = _sourceHint;
          _translate(localeCode);
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextField(
            controller: widget.controller,
            style: TextStyle(color: Theme.of(context).textTheme.bodyLarge?.color),
            onChanged: widget.onChanged,
            decoration: InputDecoration(
              hintText: _hint,
              hintStyle: TextStyle(
                  color: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.color
                      ?.withOpacity(0.6)),
              prefixIcon: Padding(
                padding: const EdgeInsets.all(11.0),
                child: SvgPicture.asset(
                  "assets/icons/search_icon.svg",
                  height: 15,
                  color: Theme.of(context).textTheme.headlineLarge!.color,
                ),
              ),
              filled: true,
              fillColor: Theme.of(context).highlightColor,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        );
      },
    );
  }
}
