import 'package:app/constants/config.dart';
import 'package:country_list_pick/country_list_pick.dart';
import 'package:flutter/material.dart';

import 'custom_widgets.dart';

class CountryCodePickerField extends StatelessWidget {
  final String placeholder;
  final Function(String?) valueChange;
  const CountryCodePickerField(
      {Key? key, required this.placeholder, required this.valueChange})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: double.infinity),
      decoration: BoxDecoration(
          color: const Color(0xff8D8D8D).withOpacity(0.1),
          borderRadius: const BorderRadius.all(Radius.circular(10.0))),
      child: CountryListPick(
        appBar: const AppTopBar('Select Country'),
        theme: CountryTheme(
          isShowFlag: true,
          isShowTitle: false,
          isShowCode: false,
          isDownIcon: true,
          showEnglishName: false,
          labelColor: Config.appColorBlue,
          alphabetSelectedBackgroundColor: Config.appColorBlue,
          alphabetTextColor: Config.appColorBlue,
          alphabetSelectedTextColor: Config.appColorBlue,
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
  final bool codeSent;
  final Function(String value, int position) callbackFn;
  final int position;
  const OptField(
      {Key? key,
      required this.codeSent,
      required this.callbackFn,
      required this.position})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: TextFormField(
        onChanged: (value) {
          callbackFn(value, position);
        },
        showCursor: codeSent,
        textAlign: TextAlign.center,
        maxLength: 6,
        enableSuggestions: false,
        cursorWidth: 1,
        autofocus: true,
        cursorColor: Config.appColorBlue,
        keyboardType: TextInputType.number,
        style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w500,
            color: Config.appColorBlue,
            letterSpacing: 16 * 0.41,
            height: 40 / 32),
        decoration: InputDecoration(
          contentPadding:
              const EdgeInsets.symmetric(vertical: 10, horizontal: 0),
          counter: const Offstage(),
          fillColor: codeSent
              ? Colors.white
              : const Color(0xff8D8D8D).withOpacity(0.1),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
            borderRadius: BorderRadius.circular(8.0),
          ),
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
            borderRadius: BorderRadius.circular(8.0),
          ),
          errorStyle: const TextStyle(
            fontSize: 0,
          ),
        ),
      ),
    );
  }
}

class TextInputCloseButton extends StatelessWidget {
  const TextInputCloseButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Container(
        decoration: BoxDecoration(
            color: Config.greyColor.withOpacity(0.7),
            borderRadius: const BorderRadius.all(Radius.circular(5.0))),
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
