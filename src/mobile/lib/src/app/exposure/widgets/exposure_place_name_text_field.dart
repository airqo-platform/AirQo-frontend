import 'package:flutter/material.dart';

import 'package:airqo/src/meta/utils/colors.dart';

/// Tag / place name field: focus ring, blue glow, Inter typography (Figma input spec).
class ExposurePlaceNameTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? hintText;
  final bool isDark;
  final TextCapitalization textCapitalization;
  final int? maxLines;
  final int? minLines;
  final bool enabled;
  final FocusNode? focusNode;

  const ExposurePlaceNameTextField({
    super.key,
    required this.controller,
    this.hintText,
    required this.isDark,
    this.textCapitalization = TextCapitalization.words,
    this.maxLines = 1,
    this.minLines,
    this.enabled = true,
    this.focusNode,
  });

  static const _borderIdle = Color(0xFFD0D5DD);
  static const _borderFocused = Color(0xFF287DFF);
  static const _glow = Color(0xFFD7E9FF);
  static const _textLight = Color(0xFF333946);
  static const _borderIdleDark = Color(0xFF4A4E57);

  @override
  State<ExposurePlaceNameTextField> createState() => _ExposurePlaceNameTextFieldState();
}

class _ExposurePlaceNameTextFieldState extends State<ExposurePlaceNameTextField> {
  FocusNode? _internalFocusNode;
  bool _focused = false;

  FocusNode get _focusNode => widget.focusNode ?? (_internalFocusNode ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_handleFocusChange);
  }

  void _handleFocusChange() {
    setState(() => _focused = _focusNode.hasFocus);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _internalFocusNode?.dispose();
    super.dispose();
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
          color: ExposurePlaceNameTextField._glow,
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
    final idle = widget.isDark ? ExposurePlaceNameTextField._borderIdleDark : ExposurePlaceNameTextField._borderIdle;

    return Theme(
      data: Theme.of(context).copyWith(
        textSelectionTheme: TextSelectionThemeData(
          cursorColor: AppColors.primaryColor,
          selectionHandleColor: AppColors.primaryColor,
          selectionColor: AppColors.primaryColor.withValues(alpha: 0.22),
        ),
      ),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        decoration: BoxDecoration(
          color: widget.isDark ? const Color(0xFF2E2F33) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: _focused ? ExposurePlaceNameTextField._borderFocused : idle,
            width: 1,
          ),
          boxShadow: _shadows,
        ),
        child: TextField(
          controller: widget.controller,
          focusNode: _focusNode,
          enabled: widget.enabled,
          maxLines: widget.maxLines,
          minLines: widget.minLines,
          cursorColor: AppColors.primaryColor,
          cursorWidth: 1,
          cursorHeight: 24,
          textCapitalization: widget.textCapitalization,
          textAlignVertical:
              (widget.maxLines ?? 1) > 1 ? TextAlignVertical.top : TextAlignVertical.center,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: FontWeight.w400,
            height: 24 / 16,
            color: widget.isDark ? Colors.white : ExposurePlaceNameTextField._textLight,
          ),
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: TextStyle(
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: FontWeight.w400,
              height: 24 / 16,
              color: AppColors.boldHeadlineColor.withValues(alpha: widget.isDark ? 0.5 : 0.45),
            ),
            border: InputBorder.none,
            isDense: true,
            contentPadding: const EdgeInsets.all(12),
          ),
        ),
      ),
    );
  }
}
