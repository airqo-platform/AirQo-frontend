
import 'package:app/constants/app_constants.dart';
import 'package:flutter/material.dart';

class ChangeThemeDialog extends StatefulWidget {
  const ChangeThemeDialog({required this.onValueChange, required this.initialValue});

  final Themes initialValue;
  final void Function(Themes) onValueChange;

  @override
  State createState() => ChangeThemeDialogState();
}

class ChangeThemeDialogState extends State<ChangeThemeDialog> {

  Themes? _theme = Themes.lightTheme;

  @override
  void initState() {
    super.initState();
    _theme = widget.initialValue;
  }

  @override
  Widget build(BuildContext context) {
    return SimpleDialog(
      title: const Text('Change Theme'),
      children: <Widget>[
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<Themes>(
              title: const Text('Light Theme'),
              value: Themes.lightTheme,
              groupValue: _theme,
              onChanged: (Themes? value) {
                setState(() {
                  _theme = value;
                });
              },
            ),
            RadioListTile<Themes>(
              title: const Text('Dark Theme'),
              value: Themes.darkTheme,
              groupValue: _theme,
              onChanged: (Themes? value) {
                setState(() {
                  _theme = value;
                });
              },
            ),
          ],
        ),
      ],
    );
  }

}