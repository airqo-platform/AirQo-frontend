import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/other/language/bloc/language_bloc.dart';
import 'package:airqo/src/app/shared/services/mlkit_translation_service.dart';
import 'package:airqo/src/app/shared/services/sunbird_translation_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class FormFieldWidget extends StatefulWidget {
  final bool? isAuthFormField;
  final String? Function(String? value)? validator;
  final TextEditingController controller;
  final String? hintText;
  final bool? isPassword;
  final TextInputType? textInputType;
  final int? maxLines;
  final String? label;
  final Widget? suffixIcon;
  final bool? hasBottomPadding;
  final Widget? prefixIcon;
  final double? height;
  final bool? enabled;
  final void Function()? onEditingComplete;
  final void Function(String)? onChanged;

  const FormFieldWidget(
      {super.key,
      this.validator,
      this.isPassword,
      this.enabled,
      this.prefixIcon,
      this.isAuthFormField,
      this.label,
      this.onEditingComplete,
      this.onChanged,
      this.suffixIcon,
      this.textInputType,
      this.hintText,
      this.hasBottomPadding = false,
      this.maxLines,
      this.height,
      required this.controller});

  @override
  State<FormFieldWidget> createState() => _FormFieldWidgetState();
}

class _FormFieldWidgetState extends State<FormFieldWidget> {
  String _hint = '';
  String _label = '';
  String? _lastLocale;

  @override
  void initState() {
    super.initState();
    _hint = widget.hintText ?? '';
    _label = widget.label ?? '';
  }

  void _translate(String localeCode) {
    final isSunbird = SunbirdTranslationService().supportsTranslation(localeCode);
    final isMlKit = MlKitTranslationService().supportsTranslation(localeCode);

    if (!isSunbird && !isMlKit) {
      if (_hint != (widget.hintText ?? '') || _label != (widget.label ?? '')) {
        setState(() {
          _hint = widget.hintText ?? '';
          _label = widget.label ?? '';
        });
      }
      return;
    }

    final requestLocale = localeCode;

    if (widget.hintText != null && widget.hintText!.isNotEmpty) {
      final future = isSunbird
          ? SunbirdTranslationService().translate(widget.hintText!, targetLocale: localeCode)
          : MlKitTranslationService().translate(widget.hintText!, targetLocale: localeCode);
      future.then((result) {
        if (mounted && requestLocale == _lastLocale && _hint != result) {
          setState(() => _hint = result);
        }
      });
    }

    if (widget.label != null && widget.label!.isNotEmpty) {
      final future = isSunbird
          ? SunbirdTranslationService().translate(widget.label!, targetLocale: localeCode)
          : MlKitTranslationService().translate(widget.label!, targetLocale: localeCode);
      future.then((result) {
        if (mounted && requestLocale == _lastLocale && _label != result) {
          setState(() => _label = result);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LanguageBloc, LanguageState>(
      builder: (context, state) {
        final localeCode = state is LanguageLoaded ? state.languageCode : 'en';

        if (localeCode != _lastLocale) {
          _lastLocale = localeCode;
          _hint = widget.hintText ?? '';
          _label = widget.label ?? '';
          _translate(localeCode);
        }

        return widget.isAuthFormField == null || !widget.isAuthFormField!
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _label,
                    style: const TextStyle(color: Color(0xff4B4E56)),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    child: TextFormField(
                        enabled: widget.enabled ?? true,
                        autofocus: false,
                        style: TextStyle(
                            fontSize: 14,
                            color: Theme.of(context).brightness == Brightness.dark
                                ? Colors.white
                                : Colors.black),
                        cursorColor: AppColors.primaryColor,
                        autocorrect: false,
                        validator: widget.validator,
                        onEditingComplete: widget.onEditingComplete,
                        onChanged: widget.onChanged,
                        maxLines: widget.maxLines ?? 1,
                        keyboardType: widget.textInputType,
                        obscureText: widget.isPassword ?? false,
                        decoration: InputDecoration(
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 19, horizontal: 10),
                            hintStyle: const TextStyle(color: Color(0xff7A7F87)),
                            suffixIconColor: Colors.grey,
                            suffixIcon: widget.suffixIcon,
                            fillColor: Theme.of(context).highlightColor,
                            disabledBorder: const OutlineInputBorder(
                                borderSide: BorderSide(color: Colors.transparent)),
                            focusedBorder: OutlineInputBorder(
                                borderSide:
                                    BorderSide(color: AppColors.primaryColor)),
                            enabledBorder: const OutlineInputBorder(
                                borderSide: BorderSide(color: Colors.transparent)),
                            filled: true,
                            prefixIcon: widget.prefixIcon,
                            border: InputBorder.none,
                            hintText: _hint),
                        controller: widget.controller),
                  ),
                ],
              )
            : SizedBox(
                child: TextFormField(
                  cursorColor: AppColors.primaryColor,
                  controller: widget.controller,
                  validator: widget.validator,
                  onChanged: widget.onChanged,
                  obscureText: widget.isPassword ?? false,
                  decoration: InputDecoration(
                      hintText: _hint,
                      iconColor: AppColors.primaryColor,
                      prefixIconColor: AppColors.primaryColor,
                      suffixIconColor: AppColors.primaryColor,
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: AppColors.primaryColor),
                      ),
                      hintStyle: const TextStyle(color: Colors.grey),
                      focusColor: AppColors.primaryColor,
                      hoverColor: AppColors.primaryColor,
                      icon: widget.prefixIcon),
                ),
              );
      },
    );
  }
}
