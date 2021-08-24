import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

class ChangeLanguageDialog extends StatefulWidget {
  const ChangeLanguageDialog(
      {required this.onValueChange, required this.initialValue});

  final Languages initialValue;
  final void Function(Languages) onValueChange;

  @override
  State createState() => ChangeLanguageDialogState();
}

class ChangeLanguageDialogState extends State<ChangeLanguageDialog> {
  Languages? _language = Languages.English;

  @override
  void initState() {
    super.initState();
    _language = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return SimpleDialog(
      title: const Text('Change Language'),
      children: <Widget>[
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<Languages>(
              selected: _language == Languages.English,
              title: const Text('English'),
              value: Languages.English,
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
              selected: _language == Languages.Luganda,
              title: const Text('Luganda'),
              value: Languages.Luganda,
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
}
