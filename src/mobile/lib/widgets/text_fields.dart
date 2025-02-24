import 'package:app/models/models.dart';
import 'package:app/themes/theme.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'custom_widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

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
    required this.status,
  });
  final String placeholder;
  final AuthenticationStatus status;
  final Function(String?) valueChange;

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    switch (status) {
      case AuthenticationStatus.initial:
        backgroundColor = const Color(0xff8D8D8D).withOpacity(0.1);
        break;
      case AuthenticationStatus.error:
        backgroundColor = CustomColors.appColorInvalid.withOpacity(0.1);
        break;
      case AuthenticationStatus.success:
        backgroundColor = CustomColors.appColorValid.withOpacity(0.05);
        break;
    }

    return Container(
      constraints: const BoxConstraints(minWidth: double.infinity),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: const BorderRadius.all(
          Radius.circular(10.0),
        ),
      ),
      child: CountryListPick(
        appBar: AppTopBar(
          AppLocalizations.of(context)!.selectCountry,
        ),
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
          if (code != null && status != AuthenticationStatus.success) {
            valueChange(code.dialCode);
          }
        },
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
