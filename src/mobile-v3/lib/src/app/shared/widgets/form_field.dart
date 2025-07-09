import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class FormFieldWidget extends StatelessWidget {
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

  const FormFieldWidget(
      {this.validator,
      this.isPassword,
      this.enabled,
      this.prefixIcon,
      this.isAuthFormField,
      this.label,
      this.onEditingComplete,
      this.suffixIcon,
      this.textInputType,
      this.hintText,
      this.hasBottomPadding = false,
      this.maxLines,
      this.height,
      required this.controller, required Null Function(dynamic value) onChanged});
  @override
  Widget build(BuildContext context) {
    return isAuthFormField == null || !isAuthFormField!
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label ?? "",
                style: TextStyle(color: Color(0xff4B4E56)),
              ),
              SizedBox(height: 8),
              SizedBox(
                child: TextFormField(
                    enabled: enabled ?? true,
                    autofocus: false,
                    style: TextStyle(
                        fontSize: 14,
                        color: Theme.of(context).brightness == Brightness.dark
                            ? Colors.white
                            : Colors.black),
                    cursorColor: AppColors.primaryColor,
                    autocorrect: false,
                    validator: validator,
                    onEditingComplete: onEditingComplete,
                    maxLines: maxLines ?? 1,
                    keyboardType: textInputType,
                    obscureText: isPassword ?? false,
                    decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 19, horizontal: 10),
                        hintStyle: TextStyle(color: Color(0xff7A7F87)),
                        suffixIconColor: Colors.grey,
                        suffixIcon: suffixIcon,
                        fillColor: Theme.of(context).highlightColor,
                        disabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.transparent)),
                        focusedBorder: OutlineInputBorder(
                            borderSide:
                                BorderSide(color: AppColors.primaryColor)),
                        enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.transparent)),
                        filled: true,
                        prefixIcon: prefixIcon,
                        border: InputBorder.none,
                        hintText: hintText),
                    controller: controller),
              ),
            ],
          )
        : SizedBox(
            child: TextFormField(
              cursorColor: AppColors.primaryColor,
              controller: controller,
              validator: validator,
              obscureText: isPassword ?? false,
              decoration: InputDecoration(
                  hintText: hintText,
                  iconColor: AppColors.primaryColor,
                  prefixIconColor: AppColors.primaryColor,
                  suffixIconColor: AppColors.primaryColor,
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: AppColors.primaryColor),
                  ),
                  hintStyle: TextStyle(color: Colors.grey),
                  focusColor: AppColors.primaryColor,
                  hoverColor: AppColors.primaryColor,
                  icon: prefixIcon),
            ),
          );
  }
}
