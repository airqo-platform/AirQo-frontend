import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/screens/tips_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/native_api.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'about_page.dart';
import 'faqs_page.dart';
import 'feedback_page.dart';

class SettingsPage extends StatefulWidget {
  SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  var userProfile = UserDetails.initialize();
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  bool allowNotification = false;
  bool allowLocation = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Settings'),
        body: Container(
            color: ColorConstants.appBodyColor,
            child: RefreshIndicator(
                onRefresh: initialize,
                color: ColorConstants.appColor,
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
                      deleteAccountSection(),
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
            '$text',
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 16),
          ),
        ));
  }

  Widget deleteAccountSection() {
    return GestureDetector(
      onTap: () {},
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
    await NotificationService().checkPermission().then((value) => {
          setState(() {
            allowNotification = value;
          }),
        });

    await LocationService().checkPermission().then((value) => {
          setState(() {
            allowLocation = value;
          }),
        });

    await _customAuth.getProfile().then((value) => {
          setState(() {
            userProfile = value;
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
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return const TipsPage();
              }));
            },
            child: Container(
                height: 56,
                decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.all(Radius.circular(0.0))),
                child: ListTile(
                  title: const Text(
                    'Location',
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 16),
                  ),
                  trailing: CupertinoSwitch(
                    activeColor: ColorConstants.green,
                    onChanged: (bool value) {
                      if (value) {
                        LocationService()
                            .requestLocationAccess()
                            .then((response) => {
                                  setState(() {
                                    allowLocation = response;
                                  })
                                });
                      } else {
                        NotificationService()
                            .revokePermission()
                            .then((response) => {
                                  setState(() {
                                    allowLocation = response;
                                  })
                                });
                      }
                    },
                    value: allowLocation,
                  ),
                )),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          GestureDetector(
              onTap: () async {
                await Navigator.push(context,
                    MaterialPageRoute(builder: (context) {
                  return const TipsPage();
                }));
              },
              child: ListTile(
                title: const Text(
                  'Notification',
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 16),
                ),
                trailing: CupertinoSwitch(
                  activeColor: ColorConstants.green,
                  onChanged: (bool value) {
                    if (value) {
                      NotificationService()
                          .requestPermission()
                          .then((response) => {
                                setState(() {
                                  allowNotification = response;
                                })
                              });
                    } else {
                      NotificationService()
                          .revokePermission()
                          .then((response) => {
                                setState(() {
                                  allowNotification = response;
                                })
                              });
                    }
                  },
                  value: allowNotification,
                ),
              )),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return FaqsPage();
              }));
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
                return FeedbackPage();
              }));
            },
            child: cardSection('Send feedback'),
          ),
          Divider(
            color: ColorConstants.appBodyColor,
          ),
          GestureDetector(
            onTap: () async {
              await Navigator.push(context,
                  MaterialPageRoute(builder: (context) {
                return TermsAndPolicy();
              }));
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
                return AboutAirQo();
              }));
            },
            child: cardSection('About'),
          ),
        ],
      ),
    );
  }
}
