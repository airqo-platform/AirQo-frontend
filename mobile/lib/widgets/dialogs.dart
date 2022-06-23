import 'package:app/utils/extensions.dart';
import 'package:app/utils/pm.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../models/enum_constants.dart';
import '../themes/app_theme.dart';
import '../themes/colors.dart';

void pmInfoDialog(context, double pm2_5) {
  showGeneralDialog(
    barrierColor: Colors.transparent,
    context: context,
    barrierDismissible: false,
    transitionDuration: const Duration(milliseconds: 250),
    transitionBuilder: (
      context,
      animation,
      secondaryAnimation,
      child,
    ) {
      return FadeTransition(
        opacity: animation,
        child: ScaleTransition(
          scale: animation,
          child: child,
        ),
      );
    },
    pageBuilder: (
      context,
      animation,
      secondaryAnimation,
    ) {
      return AlertDialog(
        scrollable: false,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
        ),
        contentPadding: const EdgeInsets.all(0),
        content: Container(
          width: 280.0,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
          ),
          child: MediaQuery.removePadding(
            context: context,
            removeTop: true,
            removeBottom: true,
            removeLeft: true,
            removeRight: true,
            child: ListView(
              shrinkWrap: true,
              physics: const BouncingScrollPhysics(),
              children: [
                const SizedBox(
                  height: 16,
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Know Your Air',
                        style: CustomTextStyle.headline10(context)
                            ?.copyWith(color: CustomColors.appColorBlue),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pop(context, 'OK'),
                        child: SvgPicture.asset(
                          'assets/icon/close.svg',
                          semanticsLabel: 'Pm2.5',
                          height: 20,
                          width: 20,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 11,
                ),
                Divider(
                  height: 1,
                  color: CustomColors.appColorBlack.withOpacity(0.2),
                ),
                const SizedBox(
                  height: 8,
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 16,
                    right: 16,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 14,
                                color: CustomColors.appColorBlack,
                                fontWeight: FontWeight.bold,
                                height: 18 / 14,
                              ),
                            ),
                            TextSpan(
                              text: '2.5',
                              style: TextStyle(
                                fontSize: 12,
                                color: CustomColors.appColorBlack,
                                fontWeight: FontWeight.bold,
                                height: 12 / 9,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 5,
                      ),
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'Particulate matter(PM) ',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                height: 14 / 10,
                                color: CustomColors.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: 'is a complex mixture of extremely'
                                  ' small particles and liquid droplets.',
                              style: TextStyle(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.7),
                                fontSize: 10,
                                height: 14 / 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      RichText(
                        text: TextSpan(
                          children: <TextSpan>[
                            TextSpan(
                              text: 'When measuring particles there are two '
                                  'size categories commonly used: ',
                              style: TextStyle(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.7),
                                fontSize: 10,
                                height: 14 / 10,
                              ),
                            ),
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: CustomColors.appColorBlack,
                                height: 14 / 10,
                              ),
                            ),
                            TextSpan(
                              text: '2.5',
                              style: TextStyle(
                                fontSize: 7,
                                fontWeight: FontWeight.w800,
                                color: CustomColors.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: ' and ',
                              style: TextStyle(
                                fontSize: 10,
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.7),
                                height: 14 / 10,
                              ),
                            ),
                            TextSpan(
                              text: 'PM',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: CustomColors.appColorBlack,
                                height: 14 / 10,
                              ),
                            ),
                            TextSpan(
                              text: '10',
                              style: TextStyle(
                                fontSize: 7,
                                fontWeight: FontWeight.w800,
                                color: CustomColors.appColorBlack,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 17.35,
                      ),
                      Container(
                        padding: const EdgeInsets.fromLTRB(
                          12,
                          2.0,
                          12,
                          2,
                        ),
                        decoration: BoxDecoration(
                          color: Pollutant.pm2_5.color(pm2_5).withOpacity(0.4),
                          borderRadius: const BorderRadius.all(
                            Radius.circular(537.0),
                          ),
                        ),
                        child: AutoSizeText(
                          Pollutant.pm2_5.stringValue(pm2_5),
                          maxLines: 2,
                          minFontSize: 10,
                          maxFontSize: 10,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10,
                            color: Pollutant.pm2_5.textColor(value: pm2_5),
                            height: 14 / 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(
                        height: 6.35,
                      ),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '${Pollutant.pm2_5.stringValue(pm2_5)}'
                                  ' means; ',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                height: 14 / 10,
                                color: CustomColors.appColorBlack,
                              ),
                            ),
                            TextSpan(
                              text: pmToInfoDialog(pm2_5),
                              style: TextStyle(
                                color:
                                    CustomColors.appColorBlack.withOpacity(0.7),
                                fontSize: 10,
                                height: 14 / 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 16,
                ),
              ],
            ),
          ),
        ),
      );
    },
  );
}

Future<void> showSnackBar(context, String message) async {
  final snackBar = SnackBar(
    duration: const Duration(seconds: 2),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    elevation: 10,
    behavior: SnackBarBehavior.floating,
    content: Text(
      message,
      softWrap: true,
      textAlign: TextAlign.center,
      style: const TextStyle(
        color: Colors.white,
      ),
    ),
    backgroundColor: CustomColors.snackBarBgColor,
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}

class AuthConfirmationDialog extends StatelessWidget {
  const AuthConfirmationDialog({
    Key? key,
    required this.authMethod,
    required this.credentials,
  }) : super(key: key);
  final AuthMethod authMethod;
  final String credentials;

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: Text(
        authMethod == AuthMethod.email
            ? 'Confirm Email Address'
            : 'Confirm Phone Number',
        textAlign: TextAlign.center,
      ),
      content: Column(
        children: [
          const SizedBox(
            height: 7,
          ),
          Text(
            credentials,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              height: 18 / 16,
            ),
          ),
          const SizedBox(
            height: 7,
          ),
          Text(
            authMethod == AuthMethod.email
                ? 'Is the email address above correct?'
                : 'Is the phone number above correct?',
            textAlign: TextAlign.center,
          ),
        ],
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.cancel);
          },
          child: Text(
            'Edit',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
          isDefaultAction: true,
          isDestructiveAction: true,
        ),
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.ok);
          },
          child: Text(
            'Yes',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
          isDefaultAction: true,
          isDestructiveAction: false,
        ),
      ],
    );
  }
}
