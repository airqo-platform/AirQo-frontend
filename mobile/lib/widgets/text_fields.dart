import 'package:app/blocs/blocs.dart';
import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'custom_widgets.dart';

class PhoneNumberInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final number = newValue.text;

    if (newValue.selection.baseOffset == 0) {
      return newValue;
    }

    final stringBuffer = StringBuffer();
    for (var i = 0; i < number.length; i++) {
      stringBuffer.write(number[i]);
      var nonZeroIndex = i + 1;
      if (nonZeroIndex % 3 == 0 && nonZeroIndex != number.length) {
        stringBuffer.write(' ');
      }
    }

    final string = stringBuffer.toString();

    return newValue.copyWith(
      text: string,
      selection: TextSelection.collapsed(offset: string.length),
    );
  }
}

class CountryCodePickerField extends StatelessWidget {
  const CountryCodePickerField({
    super.key,
    required this.placeholder,
    required this.valueChange,
  });
  final String placeholder;
  final Function(String?) valueChange;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: double.infinity),
      decoration: BoxDecoration(
        color: const Color(0xff8D8D8D).withOpacity(0.1),
        borderRadius: const BorderRadius.all(
          Radius.circular(10.0),
        ),
      ),
      child: CountryListPick(
        appBar: const AppTopBar('Select Country'),
        theme: CountryTheme(
          isShowFlag: true,
          isShowTitle: false,
          isShowCode: false,
          isDownIcon: true,
          showEnglishName: false,
          labelColor: CustomColors.appColorBlue,
          alphabetSelectedBackgroundColor: CustomColors.appColorBlue,
          alphabetTextColor: CustomColors.appColorBlue,
          alphabetSelectedTextColor: CustomColors.appColorBlue,
        ), //show down icon on dropdown
        initialSelection: placeholder,
        onChanged: (CountryCode? code) {
          if (code != null) {
            valueChange(code.dialCode);
          }
        },
      ),
    );
  }
}

class OptField extends StatelessWidget {
  const OptField({
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
            Color fillColor = Colors.transparent;
            Color textColor = CustomColors.appColorBlue;
            bool codeSent = state.codeCountDown <= 0;

            if (!codeSent) {
              fillColor = const Color(0xff8D8D8D).withOpacity(0.1);
              textColor = Colors.transparent;
            }

            if (state.status == AuthCodeStatus.error) {
              textColor = CustomColors.appColorInvalid;
              fillColor = textColor.withOpacity(0.05);
            } else if (state.status == AuthCodeStatus.success) {
              textColor = CustomColors.appColorValid;
              fillColor = textColor.withOpacity(0.05);
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

class TextInputCloseButton extends StatelessWidget {
  const TextInputCloseButton({super.key, this.color});

  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Container(
        decoration: BoxDecoration(
          color: color ?? CustomColors.greyColor.withOpacity(0.7),
          borderRadius: const BorderRadius.all(
            Radius.circular(5.0),
          ),
        ),
        height: 15,
        width: 15,
        child: const Center(
          child: Icon(
            Icons.clear,
            size: 12,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
