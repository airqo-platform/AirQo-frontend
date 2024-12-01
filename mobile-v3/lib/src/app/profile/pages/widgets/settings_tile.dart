// ignore_for_file: must_be_immutable

import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class SettingsTile extends StatelessWidget {
  final String title;
  bool? switchValue;
  String? description;
  final String iconPath;
  final void Function(bool)? onChanged;

  SettingsTile(
      {super.key,
      required this.iconPath,
      required this.title,
      this.switchValue,
      required this.onChanged,
      this.description});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Column(
        children: [
          ListTile(
            trailing: switchValue != null
                ? Switch(
                    activeColor: Colors.white,
                    activeTrackColor: AppColors.primaryColor,
                    inactiveThumbColor: Colors.white,
                    inactiveTrackColor: Theme.of(context).highlightColor,
                    value: switchValue!,
                    onChanged: onChanged)
                : null,
            subtitle: description != null
                ? Text(description!,
                    style: TextStyle(
                        color: AppColors.secondaryHeadlineColor, fontSize: 13))
                : null,
            leading: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: Theme.of(context).highlightColor,
                  child: Center(
                    child: SvgPicture.asset(iconPath),
                  ),
                ),
              ],
            ),
            title: Text(title,
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.boldHeadlineColor)),
          ),
          Divider(
            color: Theme.of(context).highlightColor,
            indent: 80,
          )
        ],
      ),
    );
  }
}
