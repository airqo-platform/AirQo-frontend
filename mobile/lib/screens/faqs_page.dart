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

import 'favourite_places.dart';
import 'for_you_page.dart';
import 'notification_page.dart';

class AboutAirQo extends StatefulWidget {
  const AboutAirQo({Key? key}) : super(key: key);

  @override
  _AboutAirQoState createState() => _AboutAirQoState();
}

class ContactUsPage extends StatefulWidget {
  const ContactUsPage({Key? key}) : super(key: key);

  @override
  _ContactUsPageState createState() => _ContactUsPageState();
}

class FaqsPage extends StatefulWidget {
  FaqsPage({Key? key}) : super(key: key);

  @override
  _FaqsPageState createState() => _FaqsPageState();
}

class TermsAndPolicy extends StatefulWidget {
  const TermsAndPolicy({Key? key}) : super(key: key);

  @override
  _TermsAndPolicyState createState() => _TermsAndPolicyState();
}

class _AboutAirQoState extends State<AboutAirQo> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'About AirQo'),
        body: Container(
          color: ColorConstants.appBodyColor,
        ));
  }
}

class _ContactUsPageState extends State<ContactUsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Contact Us'),
        body: Container(
          color: ColorConstants.appBodyColor,
        ));
  }
}

class _FaqsPageState extends State<FaqsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'FAQs'),
        body: Container(
          color: ColorConstants.appBodyColor,
        ));
  }
}

class _TermsAndPolicyState extends State<TermsAndPolicy> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Terms & Policy'),
        body: Container(
          color: ColorConstants.appBodyColor,
        ));
  }
}
