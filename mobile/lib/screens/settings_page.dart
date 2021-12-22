import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/screens/phone_reauthenticate_screen.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/native_api.dart';
import 'package:app/services/secure_storage.dart';
import 'package:app/utils/web_view.dart';
import 'package:app/widgets/custom_shimmer.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:url_launcher/url_launcher.dart';

import 'about_page.dart';
import 'email_reauthenticate_screen.dart';
import 'feedback_page.dart';
import 'home_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final CustomAuth _customAuth = CustomAuth();
  bool _allowNotification = false;
  bool _allowLocation = false;
  final InAppReview _inAppReview = InAppReview.instance;
  final LocationService _locationService = LocationService();
  final NotificationService _notificationService = NotificationService();
  final SecureStorage _secureStorage = SecureStorage();

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
                        visible: _customAuth.isLoggedIn(),
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
    var _customAuth = CustomAuth();
    var user = _customAuth.getUser();
    var dialogContext = context;
    if (user == null) {
      loadingScreen(dialogContext);
      await _customAuth.logOut(context);
      Navigator.pop(dialogContext);
      await Navigator.pushAndRemoveUntil(context,
          MaterialPageRoute(builder: (context) {
        return const HomePage();
      }), (r) => false);
    } else {
      var authResponse = false;
      var userDetails = await _secureStorage.getUserDetails();
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
      }

      if (authResponse) {
        loadingScreen(dialogContext);
        await _customAuth.deleteAccount(context).then((value) => {
              Navigator.pop(dialogContext),
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const HomePage();
              }), (r) => false)
            });
      }
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
    initialize();
    super.initState();
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
                  _locationService.requestLocationAccess().then((response) => {
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
                  _notificationService.requestPermission().then((response) => {
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
              // await Navigator.push(context,
              //     MaterialPageRoute(builder: (context) {
              //   return FaqsPage();
              // }));
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
              if (await _inAppReview.isAvailable()) {
                // await _inAppReview.requestReview();
                await _inAppReview.openStoreListing(
                  appStoreId: Config.iosStoreId,
                );
              } else {
                if (Platform.isAndroid ||
                    Platform.isLinux ||
                    Platform.isWindows) {
                  try {
                    await launch(Config.playStoreUrl);
                  } catch (exception, stackTrace) {
                    debugPrint(
                        '${exception.toString()}\n${stackTrace.toString()}');
                  }
                } else if (Platform.isIOS || Platform.isMacOS) {
                  try {
                    await launch(Config.appStoreUrl);
                  } catch (exception, stackTrace) {
                    debugPrint(
                        '${exception.toString()}\n${stackTrace.toString()}');
                  }
                }
              }
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
