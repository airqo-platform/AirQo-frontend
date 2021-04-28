import 'package:app/config/providers/LocalProvider.dart';
import 'package:app/models/device.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

enum Languages { English, Luganda }

class _SettingsPageState extends State<SettingsPage> {
  Languages? _language = Languages.English;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: Container(
        child: ListView(
          children: <Widget>[
            Row(
              children: [
                // OutlinedButton(
                //   onPressed: () async {
                //     await showLanguageDialog(context);
                //   },
                //   child: const Text('Select Language'),
                // )
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> showLanguageDialog(BuildContext context) async {
    return await showDialog(
        context: context,
        builder: (context) {
          return StatefulBuilder(builder: (context, setState) {
            return AlertDialog(
              content: SingleChildScrollView(
                  child: Column(
                children: <Widget>[
                  RadioListTile<Languages>(
                    title: const Text('English'),
                    value: Languages.English,
                    groupValue: _language,
                    onChanged: (Languages? value) {
                      setState(() {
                        _language = value;
                      });
                    },
                  ),
                  RadioListTile<Languages>(
                    title: const Text('Luganda'),
                    value: Languages.Luganda,
                    groupValue: _language,
                    onChanged: (Languages? value) {
                      setState(() {
                        _language = value;
                      });
                    },
                  ),
                ],
              )),
              title: const Text('Select Language'),
              actions: <Widget>[
                OutlinedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: new Text('Cancel')),
                OutlinedButton(
                    onPressed: () {
                      final provider = Provider.of<localProvider>(context);

                      print(_language.toString());

                      if (_language.toString() == 'English') {
                        provider.setLocale(const Locale('en'));
                      } else {
                        provider.setLocale(const Locale('en'));
                      }

                      Navigator.of(context).pop();
                    },
                    child: new Text('Save')),
              ],
            );
          });
        });
  }
}
