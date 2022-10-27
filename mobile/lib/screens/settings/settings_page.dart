import 'package:app/constants/config.dart';
import 'package:app/models/models.dart';
import 'package:app/screens/settings/settings_page_widgets.dart';
import 'package:app/screens/web_view_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../services/firebase_service.dart';
import '../../services/hive_service.dart';
import '../../services/location_service.dart';
import '../../services/native_api.dart';
import '../../services/notification_service.dart';
import '../../themes/colors.dart';
import '../auth/email_reauthenticate_screen.dart';
import '../auth/phone_auth_widget.dart';
import '../auth/phone_reauthenticate_screen.dart';
import '../feedback/feedback_page.dart';
import 'about_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({
    super.key,
  });

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final AppService _appService = AppService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar('Settings'),
      body: ValueListenableBuilder<Box>(
        valueListenable: Hive.box<Profile>(HiveBox.profile)
            .listenable(keys: [HiveBox.profile]),
        builder: (context, box, widget) {
          if (box.values.isEmpty || !CustomAuth.isLoggedIn()) {
            Profile.getProfile();
          }
          final profile = box.values.toList().cast<Profile>().first;

          return Container(
            color: CustomColors.appBodyColor,
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                const SizedBox(
                  height: 31,
                ),
                Container(
                  padding: const EdgeInsets.only(top: 10, bottom: 10),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(
                      Radius.circular(8.0),
                    ),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        title: Text(
                          'Location',
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyText1,
                        ),
                        trailing: CupertinoSwitch(
                          activeColor: CustomColors.appColorBlue,
                          onChanged: (bool value) {
                            switch (value) {
                              case true:
                                LocationService.allowLocationAccess();
                                break;
                              case false:
                                LocationService.revokePermission();
                                break;
                            }
                          },
                          value: profile.preferences.location,
                        ),
                      ),
                      Divider(
                        color: CustomColors.appBodyColor,
                      ),
                      ListTile(
                        title: Text(
                          'Notification',
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyText1,
                        ),
                        trailing: CupertinoSwitch(
                          activeColor: CustomColors.appColorBlue,
                          onChanged: (bool value) {
                            switch (value) {
                              case true:
                                NotificationService.allowNotifications();
                                break;
                              case false:
                                NotificationService.revokePermission();
                                break;
                            }
                          },
                          value: profile.preferences.notifications,
                        ),
                      ),
                      Divider(
                        color: CustomColors.appBodyColor,
                      ),
                      Visibility(
                        visible: false,
                        child: GestureDetector(
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) {
                                  return WebViewScreen(
                                    url: Config.faqsUrl,
                                    title: 'AirQo FAQs',
                                  );
                                },
                              ),
                            );
                          },
                          child: const SettingsCard(text: 'FAQs'),
                        ),
                      ),
                      Visibility(
                        visible: false,
                        child: Divider(
                          color: CustomColors.appBodyColor,
                        ),
                      ),
                      GestureDetector(
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return const FeedbackPage();
                              },
                            ),
                          );
                        },
                        child: const SettingsCard(text: 'Send feedback'),
                      ),
                      Divider(
                        color: CustomColors.appBodyColor,
                      ),
                      GestureDetector(
                        onTap: () async {
                          await RateService.rateApp();
                        },
                        child: const SettingsCard(
                          text: 'Rate the AirQo App',
                        ),
                      ),
                      Divider(
                        color: CustomColors.appBodyColor,
                      ),
                      GestureDetector(
                        onTap: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return const AboutAirQo();
                              },
                            ),
                          );
                        },
                        child: const SettingsCard(text: 'About'),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Visibility(
                  visible: CustomAuth.isLoggedIn(),
                  child: DeleteAccountButton(
                    deleteAccount: _deleteAccount,
                  ),
                ),
                const SizedBox(
                  height: 32,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _deleteAccount() async {
    final action = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const AuthProcedureDialog(
          authProcedure: AuthProcedure.deleteAccount,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    final user = CustomAuth.getUser();
    final dialogContext = context;

    if (user == null) {
      await showSnackBar(
        context,
        Config.appErrorMessage,
      );

      return;
    }

    bool authResponse;
    final profile = await Profile.getProfile();
    if (user.email != null) {
      profile.emailAddress = user.email!;
      authResponse = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) {
            return EmailReAuthenticateScreen(profile);
          },
        ),
      );
    } else if (user.phoneNumber != null) {
      profile.phoneNumber = user.phoneNumber!;
      authResponse = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) {
            return PhoneReAuthenticateScreen(profile);
          },
        ),
      );
    } else {
      authResponse = false;
    }

    if (authResponse) {
      loadingScreen(dialogContext);

      final success = await _appService.authenticateUser(
        authMethod: AuthMethod.none,
        authProcedure: AuthProcedure.deleteAccount,
      );
      if (success) {
        Navigator.pop(dialogContext);
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return const PhoneSignUpWidget();
          }),
          (r) => false,
        );
      } else {
        await showSnackBar(
          context,
          'Error occurred. Try again later',
        );
      }
    } else {
      await showSnackBar(
        context,
        'Authentication failed '
        'Try again later',
      );
    }
  }
}
