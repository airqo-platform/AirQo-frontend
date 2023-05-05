import 'package:app/blocs/blocs.dart';
import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';


class EditOptField extends StatelessWidget {
  const EditOptField({
    super.key,
    required this.callbackFn,
  });
  final Function(String value) callbackFn;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 36),
        child: BlocBuilder<AuthCodeBloc, AuthCodeState>(
          builder: (context, state) {
            Color fillColor;
            Color textColor;
            bool codeSent = state.codeCountDown <= 0;

            switch (state.status) {
              case AuthCodeStatus.initial:
                if (!codeSent) {
                  fillColor = const Color(0xff8D8D8D).withOpacity(0.1);
                  textColor = Colors.transparent;
                  break;
                }
                fillColor = Colors.transparent;
                textColor = CustomColors.appColorBlue;
                break;
              case AuthCodeStatus.invalidCode:
              case AuthCodeStatus.error:
                textColor = CustomColors.appColorInvalid;
                fillColor = CustomColors.appColorInvalid.withOpacity(0.05);
                break;
              case AuthCodeStatus.success:
                textColor = CustomColors.appColorValid;
                fillColor = textColor.withOpacity(0.05);
                break;
            }

            InputBorder inputBorder = OutlineInputBorder(
              borderSide: BorderSide(color: textColor, width: 1.0),
              borderRadius: BorderRadius.circular(8.0),
            );

            return TextFormField(
              onChanged: callbackFn,
              onEditingComplete: () {
                FocusScope.of(context).requestFocus(FocusNode());
              },
              showCursor: codeSent,
              enabled: codeSent,
              textAlign: TextAlign.center,
              maxLength: 6,
              enableSuggestions: false,
              cursorWidth: 1,
              autofocus: true,
              cursorColor: textColor,
              keyboardType: TextInputType.number,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontSize: 32,
                fontWeight: FontWeight.w500,
                color: textColor,
                letterSpacing: 16 * 0.41,
                height: 40 / 32,
              ),
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 10,
                  horizontal: 0,
                ),
                iconColor: textColor,
                fillColor: fillColor,
                filled: true,
                focusedBorder: inputBorder,
                enabledBorder: inputBorder,
                disabledBorder: inputBorder,
                errorBorder: inputBorder,
                border: inputBorder,
                counter: const Offstage(),
                errorStyle: const TextStyle(
                  fontSize: 0,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class ValidOptField extends StatelessWidget {
  const ValidOptField(this.opt, {super.key});
  final String opt;

  @override
  Widget build(BuildContext context) {
    InputBorder inputBorder = OutlineInputBorder(
      borderSide: BorderSide(color: CustomColors.appColorValid, width: 1.0),
      borderRadius: BorderRadius.circular(8.0),
    );
    Color textColor = CustomColors.appColorValid;
    Color fillColor = CustomColors.appColorValid.withOpacity(0.05);

    return SizedBox(
      height: 64,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 36),
        child: TextFormField(
          initialValue: opt,
          showCursor: false,
          enabled: false,
          textAlign: TextAlign.center,
          maxLength: 6,
          enableSuggestions: false,
          cursorWidth: 1,
          autofocus: true,
          cursorColor: textColor,
          keyboardType: TextInputType.number,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontSize: 32,
            fontWeight: FontWeight.w500,
            color: textColor,
            letterSpacing: 16 * 0.41,
            height: 40 / 32,
          ),
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(
              vertical: 10,
              horizontal: 0,
            ),
            iconColor: textColor,
            fillColor: fillColor,
            filled: true,
            focusedBorder: inputBorder,
            enabledBorder: inputBorder,
            disabledBorder: inputBorder,
            errorBorder: inputBorder,
            border: inputBorder,
            counter: const Offstage(),
            errorStyle: const TextStyle(
              fontSize: 0,
            ),
          ),
        ),
      ),
    );
  }
}
