import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/web_view.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:url_launcher/url_launcher.dart';

import 'about_page.dart';
import 'feedback_page.dart';
import 'home_page.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool isSignedIn = false;
  final CustomAuth _customAuth = CustomAuth();
  bool allowNotification = false;
  bool allowLocation = false;
  final InAppReview _inAppReview = InAppReview.instance;
  final LocationService _locationService = LocationService();
  final NotificationService _notificationService = NotificationService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Settings'),
        body: Container(
            color: ColorConstants.appBodyColor,
            child: RefreshIndicator(
                onRefresh: initialize,
                color: ColorConstants.appColorBlue,
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

  Widget deleteAccountSection() {
    return GestureDetector(
      onTap: () {
        showConfirmationDialog(context);
      },
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
                  fontSize: 14,
                  color: ColorConstants.appColorBlack.withOpacity(0.4)),
            ),
          )),
    );
  }

  Future<void> initialize() async {
    await _notificationService.checkPermission().then((value) => {
          setState(() {
            allowNotification = value;
          }),
        });

    await _locationService.checkPermission().then((value) => {
          setState(() {
            allowLocation = value;
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
              activeColor: ColorConstants.green,
              onChanged: (bool value) {
                if (value) {
                  _locationService.requestLocationAccess().then((response) => {
                        setState(() {
                          allowLocation = response;
                        })
                      });
                } else {
                  _locationService.revokePermission().then((response) => {
                        setState(() {
                          allowLocation = response;
                        })
                      });
                }
              },
              value: allowLocation,
            ),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          ListTile(
            title: const Text(
              'Notification',
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 16),
            ),
            trailing: CupertinoSwitch(
              activeColor: ColorConstants.green,
              onChanged: (bool value) {
                if (value) {
                  _notificationService.requestPermission().then((response) => {
                        setState(() {
                          allowNotification = response;
                        })
                      });
                } else {
                  _notificationService.revokePermission().then((response) => {
                        setState(() {
                          allowNotification = response;
                        })
                      });
                }
              },
              value: allowNotification,
            ),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              openUrl(Links.faqsUrl);
              // await Navigator.push(context,
              //     MaterialPageRoute(builder: (context) {
              //   return FaqsPage();
              // }));
            },
            child: cardSection('FAQs'),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
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
            color: ColorConstants.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              if (await _inAppReview.isAvailable()) {
                // await _inAppReview.requestReview();
                await _inAppReview.openStoreListing(
                  appStoreId: AppConfig.iosStoreId,
                );
              } else {
                if (Platform.isAndroid ||
                    Platform.isLinux ||
                    Platform.isWindows) {
                  try {
                    await launch(Links.playStoreUrl);
                  } catch (e) {
                    debugPrint(e.toString());
                  }
                } else if (Platform.isIOS || Platform.isMacOS) {
                  try {
                    await launch(Links.appStoreUrl);
                  } catch (e) {
                    debugPrint(e.toString());
                  }
                }
              }
            },
            child: cardSection('Rate the AirQo App'),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
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
      onPressed: () {
        var _customAuth = CustomAuth();
        _customAuth.deleteAccount(context).then((value) => {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return const HomePage();
              }), (r) => false)
            });
      },
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
