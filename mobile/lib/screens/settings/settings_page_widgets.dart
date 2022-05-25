import 'package:app/constants/config.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

class DeleteAccountButton extends StatelessWidget {
  const DeleteAccountButton({Key? key, required this.deleteAccount})
      : super(key: key);
  final Function() deleteAccount;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: deleteAccount,
      child: Container(
          height: 56,
          decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(8.0))),
          child: ListTile(
            title: AutoSizeText(
              'Delete your account',
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context)
                  .textTheme
                  .bodyText2
                  ?.copyWith(color: Config.appColorBlack.withOpacity(0.6)),
            ),
          )),
    );
  }
}

class SettingsCard extends StatelessWidget {
  const SettingsCard({Key? key, required this.text}) : super(key: key);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 56,
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(0.0))),
        child: ListTile(
          title: Text(text,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyText1),
        ));
  }
}
