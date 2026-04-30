import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';

class LocationSearchBar extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  /// When set, the caller owns the node ([FocusNode.dispose] stays with caller).
  final FocusNode? focusNode;

  const LocationSearchBar({
    super.key,
    required this.controller,
    required this.onChanged,
    this.onTap,
    this.padding = const EdgeInsets.symmetric(horizontal: 16),
    this.focusNode,
  });

  @override
  State<LocationSearchBar> createState() => _LocationSearchBarState();
}

class _LocationSearchBarState extends State<LocationSearchBar> {
  static const _sourceHint = 'Search Villages, Cities or Countries';

  // Matches ExposurePlaceNameTextField border tokens
  static const _borderIdle = Color(0xFFD0D5DD);
  static const _borderIdleDark = Color(0xFF4A4E57);
  static const _borderFocused = Color(0xFF287DFF);
  static const _glow = Color(0xFFD7E9FF);

  String _hint = _sourceHint;
  String? _lastLocale;
  FocusNode? _internalFocusNode;
  FocusNode get _effectiveFocusNode => widget.focusNode ?? _internalFocusNode!;
  bool _focused = false;

  void _syncFocusGlow() {
    if (mounted) setState(() => _focused = _effectiveFocusNode.hasFocus);
  }

  @override
  void initState() {
    super.initState();
    if (widget.focusNode != null) {
      widget.focusNode!.addListener(_syncFocusGlow);
    } else {
      _internalFocusNode = FocusNode()..addListener(_syncFocusGlow);
    }
  }

  @override
  void dispose() {
    widget.focusNode?.removeListener(_syncFocusGlow);
    _internalFocusNode?.dispose();
    super.dispose();
  }

  void _translate(String localeCode) {
    final isSunbird =
        SunbirdTranslationService().supportsTranslation(localeCode);
    final isMlKit = MlKitTranslationService().supportsTranslation(localeCode);

    if (!isSunbird && !isMlKit) {
      if (_hint != _sourceHint) setState(() => _hint = _sourceHint);
      return;
    }

    final requestLocale = localeCode;
    final future = isSunbird
        ? SunbirdTranslationService()
            .translate(_sourceHint, targetLocale: localeCode)
        : MlKitTranslationService()
            .translate(_sourceHint, targetLocale: localeCode);

    future.then((result) {
      if (mounted && requestLocale == _lastLocale && _hint != result) {
        setState(() => _hint = result);
      }
    });
  }

  List<BoxShadow> get _shadows {
    const subtle = BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    );
    if (_focused) {
      return const [
        BoxShadow(
          color: _glow,
          blurRadius: 0,
          spreadRadius: 4,
          offset: Offset.zero,
        ),
        subtle,
      ];
    }
    return const [subtle];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode =
            state is LanguageLoaded ? state.languageCode : 'en';

        if (localeCode != _lastLocale) {
          _lastLocale = localeCode;
          _hint = _sourceHint;
          _translate(localeCode);
        }

        final idleBorder =
            isDark ? _borderIdleDark : _borderIdle;

        return Padding(
          padding: widget.padding,
          child: Theme(
            data: Theme.of(context).copyWith(
              textSelectionTheme: TextSelectionThemeData(
                cursorColor: AppColors.primaryColor,
                selectionHandleColor: AppColors.primaryColor,
                selectionColor:
                    AppColors.primaryColor.withValues(alpha: 0.22),
              ),
            ),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              decoration: BoxDecoration(
                color:
                    isDark ? AppColors.darkHighlight : Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: _focused ? _borderFocused : idleBorder,
                  width: 1,
                ),
                boxShadow: _shadows,
              ),
              child: TextField(
                controller: widget.controller,
                focusNode: _effectiveFocusNode,
                cursorColor: AppColors.primaryColor,
                cursorWidth: 1.5,
                onChanged: widget.onChanged,
                onTap: widget.onTap,
                onTapAlwaysCalled: true,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: isDark
                      ? Colors.white
                      : const Color(0xFF333946),
                ),
                decoration: InputDecoration(
                  hintText: _hint,
                  hintStyle: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: isDark
                        ? AppColors.boldHeadlineColor2
                        : AppColors.boldHeadlineColor3,
                  ),
                  prefixIcon: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: SvgPicture.asset(
                      'assets/icons/search_icon.svg',
                      height: 16,
                      colorFilter: ColorFilter.mode(
                        isDark
                            ? AppColors.boldHeadlineColor2
                            : AppColors.boldHeadlineColor3,
                        BlendMode.srcIn,
                      ),
                    ),
                  ),
                  filled: false,
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(
                      vertical: 13),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
