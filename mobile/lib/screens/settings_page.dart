import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/screens/signup_page.dart';
import 'package:app/screens/tips_page.dart';
import 'package:app/screens/view_profile_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import 'faqs_page.dart';
import 'favourite_places.dart';
import 'for_you_page.dart';
import 'notification_page.dart';

class SettingsPage extends StatefulWidget {
  SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  var userProfile = UserDetails.initialize();
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);

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

  Widget cardSection(text) {
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
            child: cardSection('Location'),
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
            child: cardSection('Notification'),
          ),
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
                return ContactUsPage();
              }));
            },
            child: cardSection('Contact us'),
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
            child: cardSection('Terms & Privacy'),
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
            child: cardSection('About AirQo'),
          ),
        ],
      ),
    );
  }
}
