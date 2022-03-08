import 'package:app/auth/signup_screen.dart';
import 'package:app/constants/config.dart';
import 'package:app/screens/phone_reauthenticate_screen.dart';
import 'package:app/services/app_service.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/web_view.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'about_page.dart';
import 'email_reauthenticate_screen.dart';
import 'feedback_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _allowNotification = false;
  bool _allowLocation = false;
  final RateService _rateService = RateService();
  final LocationService _locationService = LocationService();
  final NotificationService _notificationService = NotificationService();
  late AppService _appService;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Settings'),
        body: Container(
            color: Config.appBodyColor,
            child: RefreshIndicator(
                onRefresh: initialize,
                color: Config.appColorBlue,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      const SizedBox(
                        height: 31,
                      ),
                      settingsSection(),
                      const Spacer(),
                      Visibility(
                        visible: _appService.isLoggedIn(),
                        child: deleteAccountSection(),
                      ),
                      const SizedBox(
                        height: 32,
                      ),
                    ],
                  ),
                ))));
  }

  Widget cardSection(String text) {
    return Container(
        height: 56,
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(0.0))),
        child: ListTile(
          title: Text(
            text,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16),
          ),
        ));
  }

  Future<void> deleteAccount() async {
    var user = _appService.customAuth.getUser();
    var dialogContext = context;

    if (user == null) {
      await showSnackBar(context, Config.appErrorMessage);
      return;
    }

    bool authResponse;
    var userDetails = await _appService.getUserDetails();
    if (user.email != null) {
      userDetails.emailAddress = user.email!;
      authResponse =
          await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return EmailReAuthenticateScreen(userDetails);
      }));
    } else if (user.phoneNumber != null) {
      userDetails.phoneNumber = user.phoneNumber!;
      authResponse =
          await Navigator.push(context, MaterialPageRoute(builder: (context) {
        return PhoneReAuthenticateScreen(userDetails);
      }));
    } else {
      authResponse = false;
    }

    if (authResponse) {
      loadingScreen(dialogContext);

      var success = await _appService.deleteAccount();
      if (success) {
        Navigator.pop(dialogContext);
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const SignupScreen(false);
        }), (r) => false);
      } else {
        await showSnackBar(
            context,
            'Failed to delete account. '
            'Try again later');
      }
    } else {
      await showSnackBar(
          context,
          'Authentication failed '
          'Try again later');
    }
  }

  Widget deleteAccountSection() {
    return GestureDetector(
      onTap: deleteAccount,
      child: Container(
          height: 56,
          decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.all(Radius.circular(8.0))),
          child: ListTile(
            title: Text(
              'Delete your account',
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  fontSize: 14, color: Config.appColorBlack.withOpacity(0.4)),
            ),
          )),
    );
  }

  Future<void> initialize() async {
    await _notificationService.checkPermission().then((value) => {
          setState(() {
            _allowNotification = value;
          }),
        });

    await _locationService.checkPermission().then((value) => {
          setState(() {
            _allowLocation = value;
          }),
        });
  }

  @override
  void initState() {
    super.initState();
    _appService = AppService(context);
    initialize();
  }

  Widget settingsSection() {
    return Container(
      padding: const EdgeInsets.only(top: 10, bottom: 10),
      decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.all(Radius.circular(8.0))),
      child: Column(
        children: [
          ListTile(
            title: const Text(
              'Location',
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 16),
            ),
            trailing: CupertinoSwitch(
              activeColor: Config.appColorBlue,
              onChanged: (bool value) {
                if (value) {
                  _locationService.allowLocationAccess().then((response) => {
                        setState(() {
                          _allowLocation = response;
                        })
                      });
                } else {
                  _locationService.revokePermission().then((response) => {
                        setState(() {
                          _allowLocation = response;
                        })
                      });
                }
              },
              value: _allowLocation,
            ),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          ListTile(
            title: const Text(
              'Notification',
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 16),
            ),
            trailing: CupertinoSwitch(
              activeColor: Config.appColorBlue,
              onChanged: (bool value) {
                if (value) {
                  _notificationService.allowNotifications().then((response) => {
                        setState(() {
                          _allowNotification = response;
                        })
                      });
                } else {
                  _notificationService.revokePermission().then((response) => {
                        setState(() {
                          _allowNotification = response;
                        })
                      });
                }
              },
              value: _allowNotification,
            ),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              openUrl(Config.faqsUrl);
            },
            child: cardSection('FAQs'),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const FeedbackPage();
              }));
            },
            child: cardSection('Send feedback'),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await _rateService.rateApp();
            },
            child: cardSection('Rate the AirQo App'),
          ),
          Divider(
            color: Config.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const AboutAirQo();
              }));
            },
            child: cardSection('About'),
          ),
        ],
      ),
    );
  }

  void showConfirmationDialog(BuildContext context) {
    Widget okButton = TextButton(
      child: const Text('Yes'),
      onPressed: deleteAccount,
    );

    Widget cancelButton = TextButton(
      child: const Text('No'),
      onPressed: () {
        Navigator.of(context).pop();
      },
    );

    var alert = AlertDialog(
      title: const Text('Delete Account'),
      content: const Text('Are you sure toy want to delete your account ? '),
      actions: [okButton, cancelButton],
    );

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }
}
