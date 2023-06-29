import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:permission_handler/permission_handler.dart';

import '../screens/home_page.dart';
import 'custom_shimmer.dart';

Future<void> openPhoneSettings(BuildContext context, String message) async {
  final confirmation = await showDialog<ConfirmationAction>(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext _) {
      return SettingsDialog(message);
    },
  );

  if (confirmation == ConfirmationAction.ok) {
    await openAppSettings();
  }
}

void pmInfoDialog(BuildContext context, double pm2_5) {
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
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(
              Radius.circular(8.0),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(left: 16),
                    child: Text(
                      'Know Your Air',
                      style: CustomTextStyle.headline10(context)
                          ?.copyWith(color: CustomColors.appColorBlue),
                    ),
                  ),
                  InkWell(
                    onTap: () => Navigator.pop(context, 'OK'),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                      ),
                      child: SvgPicture.asset(
                        'assets/icon/close.svg',
                        semanticsLabel: 'Close',
                        height: 20,
                        width: 20,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 8,
              ),
              Divider(
                height: 1,
                color: CustomColors.appColorBlack.withOpacity(0.2),
              ),
              const SizedBox(
                height: 8,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
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
            ],
          ),
        ),
      );
    },
  );
}

void showSnackBar(
  BuildContext context,
  String message, {
  int durationInSeconds = 2,
}) {
  final snackBar = SnackBar(
    duration: Duration(seconds: durationInSeconds),
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

Future<void> showFavouritePlaceSnackBar(
  BuildContext context,
  AirQualityReading airQualityReading, {
  int durationInSeconds = 2,
}) async {
  bool isInternetOn = await AppService().checkInternetConnectivity();
  final snackBar = SnackBar(
    duration: Duration(seconds: durationInSeconds),
    elevation: 0,
    padding: const EdgeInsets.symmetric(
      vertical: 17,
      horizontal: 22,
    ),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.all(
        Radius.circular(28.0),
      ),
    ),
    behavior: SnackBarBehavior.floating,
    content: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          height: 23,
          width: 23,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Pollutant.pm2_5.color(
              airQualityReading.pm2_5,
            ),
            border: const Border.fromBorderSide(
              BorderSide(color: Colors.transparent),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              SvgPicture.asset(
                Pollutant.pm2_5.svg,
                semanticsLabel: 'Pm2.5',
                height: 3,
                width: 8,
                colorFilter: ColorFilter.mode(
                  Pollutant.pm2_5.textColor(
                    value: airQualityReading.pm2_5,
                  ),
                  BlendMode.srcIn,
                ),
              ),
              Text(
                airQualityReading.pm2_5.toInt().toString(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: CustomTextStyle.airQualityValue(
                  pollutant: Pollutant.pm2_5,
                  value: airQualityReading.pm2_5,
                )?.copyWith(
                  fontStyle: FontStyle.normal,
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  height: 12 / 9,
                  letterSpacing: 16 * -0.022,
                ),
              ),
              SvgPicture.asset(
                'assets/icon/unit.svg',
                semanticsLabel: 'Unit',
                height: 3,
                width: 3,
                colorFilter: ColorFilter.mode(
                  Pollutant.pm2_5.textColor(
                    value: airQualityReading.pm2_5,
                  ),
                  BlendMode.srcIn,
                ),
              ),
              const Spacer(),
            ],
          ),
        ),
        const SizedBox(
          width: 12,
        ),
        isInternetOn
            ? Expanded(
          child: AutoSizeText(
            "${airQualityReading.name} has been added to your favorites",
            maxLines: 1,
            minFontSize: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
            ),
          ),
              )
            : Expanded(
                child: AutoSizeText(
                  "Currently offline, ${airQualityReading.name} will be added to your favorites when online",
                  maxLines: 1,
                  minFontSize: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                  ),
                ),
              ),
      ],
    ),
    backgroundColor: CustomColors.appColorBlack,
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}

class AuthFailureDialog extends StatelessWidget {
  const AuthFailureDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: Text(
        'Authentication is currently unavailable. You will be able to signup/sign in later.',
        textAlign: TextAlign.center,
        style: CustomTextStyle.headline8(context),
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () async {
            await _guestSignIn(context);
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            'Proceed as Guest',
            style: CustomTextStyle.button2(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }

  Future<void> _guestSignIn(BuildContext context) async {
    await hasNetworkConnection().then((hasConnection) async {
      if (!hasConnection) {
        showSnackBar(context, "No internet connection");

        return;
      }
      loadingScreen(context);
      await CustomAuth.guestSignIn().then((success) async {
        await AppService.postSignInActions(context).then((_) async {
          Navigator.pop(context);
          await Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) {
              return const HomePage();
            }),
            (r) => true,
          );
        });
      });
    });
  }
}

class SettingsDialog extends StatelessWidget {
  const SettingsDialog(this.message, {super.key});
  final String message;

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      content: Column(
        children: [
          const SizedBox(
            height: 7,
          ),
          Text(
            message,
            textAlign: TextAlign.center,
          ),
        ],
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.cancel);
          },
          isDefaultAction: true,
          isDestructiveAction: true,
          child: Text(
            'Cancel',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.ok);
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            'Proceed',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }
}

class AuthMethodDialog extends StatelessWidget {
  const AuthMethodDialog({
    super.key,
    required this.authMethod,
    required this.credentials,
  });
  final AuthMethod authMethod;
  final String credentials;

  @override
  Widget build(BuildContext context) {
    Widget title = Text(
      authMethod == AuthMethod.email
          ? 'Confirm Email Address'
          : 'Confirm Phone Number',
      textAlign: TextAlign.center,
    );

    Widget content = Column(
      mainAxisSize: MainAxisSize.min,
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
    );

    List<Widget> actions = [
      CupertinoDialogAction(
        onPressed: () {
          Navigator.of(context).pop(ConfirmationAction.cancel);
        },
        isDefaultAction: true,
        isDestructiveAction: true,
        child: Text(
          'Edit',
          style: CustomTextStyle.caption4(context)
              ?.copyWith(color: CustomColors.appColorBlue),
        ),
      ),
      CupertinoDialogAction(
        onPressed: () {
          Navigator.of(context).pop(ConfirmationAction.ok);
        },
        isDefaultAction: true,
        isDestructiveAction: false,
        child: Text(
          'Yes',
          style: CustomTextStyle.caption4(context)
              ?.copyWith(color: CustomColors.appColorBlue),
        ),
      ),
    ];

    return CupertinoAlertDialog(
      title: title,
      content: content,
      actions: actions,
    );
  }
}

class SignOutDeletionDialog extends StatelessWidget {
  const SignOutDeletionDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: const Text(
        "Re authentication is required",
        textAlign: TextAlign.center,
      ),
      content: const Padding(
        padding: EdgeInsets.all(10),
        child: Text(
          "You are required to sign in again inorder to delete your account. Do you want to proceed?",
          textAlign: TextAlign.center,
        ),
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.cancel);
          },
          isDefaultAction: true,
          isDestructiveAction: true,
          child: Text(
            "Cancel",
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.ok);
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            "Yes",
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }
}

class AuthProcedureDialog extends StatelessWidget {
  const AuthProcedureDialog({
    super.key,
    required this.authProcedure,
  });
  final AuthProcedure authProcedure;

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: Text(
        authProcedure.confirmationTitle,
        textAlign: TextAlign.center,
      ),
      content: Padding(
        padding: const EdgeInsets.all(10),
        child: Text(
          authProcedure.confirmationBody,
          textAlign: TextAlign.center,
        ),
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.cancel);
          },
          isDefaultAction: true,
          isDestructiveAction: true,
          child: Text(
            authProcedure.confirmationCancelText,
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.ok);
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            authProcedure.confirmationOkayText,
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }
}

class ChangeAuthCredentialsDialog extends StatelessWidget {
  const ChangeAuthCredentialsDialog({
    super.key,
    required this.authMethod,
  });
  final AuthMethod authMethod;

  @override
  Widget build(BuildContext context) {
    return CupertinoAlertDialog(
      title: const Text(
        'Warning !!!',
        textAlign: TextAlign.center,
      ),
      content: Padding(
        padding: const EdgeInsets.all(10),
        child: Text(
          authMethod.updateMessage,
          textAlign: TextAlign.center,
        ),
      ),
      actions: <Widget>[
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.cancel);
          },
          isDefaultAction: true,
          isDestructiveAction: true,
          child: Text(
            'Cancel',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
        CupertinoDialogAction(
          onPressed: () {
            Navigator.of(context).pop(ConfirmationAction.ok);
          },
          isDefaultAction: true,
          isDestructiveAction: false,
          child: Text(
            'Update',
            style: CustomTextStyle.caption4(context)
                ?.copyWith(color: CustomColors.appColorBlue),
          ),
        ),
      ],
    );
  }
}
