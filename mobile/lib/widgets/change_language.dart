import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

class ChangeLanguageDialog extends StatefulWidget {
  final Languages initialValue;

  final void Function(Languages) onValueChange;

  const ChangeLanguageDialog(
      {Key? key, required this.onValueChange, required this.initialValue})
      : super(key: key);

  @override
  State createState() => ChangeLanguageDialogState();
}

class ChangeLanguageDialogState extends State<ChangeLanguageDialog> {
  Languages? _language = Languages.english;

  @override
  Widget build(BuildContext context) {
    return SimpleDialog(
      title: const Text('Change Language'),
      children: <Widget>[
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<Languages>(
              selected: _language == Languages.english,
              title: const Text('English'),
              value: Languages.english,
              groupValue: _language,
              onChanged: (Languages? value) {
                setState(() {
                  _language = value;
                });

                // if(value != null){
                //   LocaleProvider().setLocale(const Locale('en'));
                //   widget.onValueChange(value);
                // }
              },
            ),
            RadioListTile<Languages>(
              selected: _language == Languages.luganda,
              title: const Text('Luganda'),
              value: Languages.luganda,
              groupValue: _language,
              onChanged: (Languages? value) {
                setState(() {
                  _language = value;
                });

                // if(value != null){
                //   LocaleProvider().setLocale(const Locale('lg'));
                //   widget.onValueChange(value);
                // }
              },
            ),
          ],
        ),
      ],
    );
  }

  @override
  void initState() {
    super.initState();
    _language = widget.initialValue;
  }
}
