import 'dart:io';

import 'package:app/constants/app_constants.dart';
import 'package:app/models/feedback.dart' as feedback_model;
import 'package:app/services/rest_api.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import 'home_page_v2.dart';

RawMaterialButton customOkayButton(context, success) {
  return RawMaterialButton(
    shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4.0),
        side: BorderSide(color: ColorConstants().appColor, width: 1)),
    fillColor: Colors.transparent,
    elevation: 0,
    highlightElevation: 0,
    splashColor: Colors.black12,
    highlightColor: ColorConstants().appColor.withOpacity(0.4),
    onPressed: () async {
      if (success) {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return HomePageV2();
        }), (r) => false);
      } else {
        Navigator.of(context).pop();
      }
    },
    child: Padding(
      padding: const EdgeInsets.all(4),
      child: Text(
        'Close',
        style: TextStyle(color: ColorConstants().appColor),
      ),
    ),
  );
}

class FailureDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Icon(
                  Icons.info_outline_rounded,
                  color: ColorConstants().red,
                ),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Oops! Something went wrong, try again later',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            customOkayButton(context, false),
          ],
        ),
      ),
    );
  }
}

class FeedbackPage extends StatefulWidget {
  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class SuccessDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Icon(
                  Icons.info_outline_rounded,
                  color: ColorConstants().appColor,
                ),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Thanks for your feedback.'
                      ' The AirQo team shall address it asap',
                      softWrap: true,
                    ),
                  ),
                ),
              ],
            ),
            customOkayButton(context, true),
          ],
        ),
      ),
    );
  }
}

class _FeedbackPageState extends State<FeedbackPage> {
  final _formKey = GlobalKey<FormState>();
  final feedbackController = TextEditingController();
  final emailController = TextEditingController();
  bool sendingFeedback = false;

  Widget airqoLogo() {
    return Image.asset(
      'assets/icon/airqo_logo.png',
      height: 50,
      width: 50,
    );
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    return Scaffold(
      appBar: AppBar(
        title: const Text('AirQo'),
      ),
      body: Container(
        height: height,
        child: Stack(
          children: <Widget>[
            Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const SizedBox(height: 10),
                    // emailInput(),
                    // const SizedBox(height: 5),
                    feedbackInput(),
                    const SizedBox(
                      height: 10,
                    ),
                    submitButton(),
                    support(),
                    footer()
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  EdgeInsets containerPadding() {
    return const EdgeInsets.fromLTRB(10, 10, 10, 0);
  }

  @override
  void dispose() {
    emailController.dispose();
    feedbackController.dispose();
    super.dispose();
  }

  Widget emailInput() {
    return TextFormField(
      controller: emailController,
      decoration: const InputDecoration(
        icon: Icon(Icons.email_outlined),
        labelText: 'Email Address (Optional)',
      ),
      keyboardType: TextInputType.emailAddress,
      onChanged: (value) {},
      textInputAction: TextInputAction.next,
    );
  }

  Widget feedbackInput() {
    return TextFormField(
      autofocus: true,
      controller: feedbackController,
      decoration: const InputDecoration(
        labelText: 'Feedback',
        hintText: 'Share your feedback to enable us make improvements.',
      ),
      textInputAction: TextInputAction.done,
      maxLines: 5,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Required';
        }
        return null;
      },
    );
  }

  Widget footer() {
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          GestureDetector(
            onTap: () {
              _launchURL('airqo');
            },
            child: Image.asset(
              'assets/icon/airqo_logo_tagline_transparent.png',
              height: 100,
              width: 100,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                  icon: const FaIcon(
                    FontAwesomeIcons.facebook,
                    color: facebookColor,
                  ),
                  onPressed: () {
                    _launchURL('facebook');
                  }),
              IconButton(
                  icon: const FaIcon(
                    FontAwesomeIcons.twitter,
                    color: twitterColor,
                  ),
                  onPressed: () {
                    _launchURL('twitter');
                  }),
              IconButton(
                  icon: const FaIcon(
                    FontAwesomeIcons.youtube,
                    color: youtubeColor,
                  ),
                  onPressed: () {
                    _launchURL('youtube');
                  }),
              IconButton(
                  icon: const FaIcon(
                    FontAwesomeIcons.linkedin,
                    color: linkedInColor,
                  ),
                  onPressed: () {
                    _launchURL('linkedin');
                  }),
            ],
          ),
          const SizedBox(
            height: 5,
          ),
          Text(
            '\u00a9 AirQo 2021',
            style: TextStyle(color: ColorConstants().appColor),
          ),
          Text(
            'Air Quality Initiative',
            style: TextStyle(color: ColorConstants().appColor),
          ),
          const SizedBox(
            height: 5,
          ),
          Text(
            'v1.21.7',
            style: TextStyle(color: ColorConstants().appColor),
          )
        ],
      ),
    );
  }

  TextStyle headerStyle() {
    return const TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 16,
    );
  }

  @override
  void initState() {
    sendingFeedback = false;
    super.initState();
  }

  Widget submitButton() {
    if (sendingFeedback) {
      return Center(
          child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(ColorConstants().appColor),
      ));
    } else {
      return ElevatedButton(
        style: ElevatedButton.styleFrom(primary: ColorConstants().appColor),
        onPressed: () async {
          if (_formKey.currentState!.validate()) {
            var email = emailController.text;
            var feedback = feedbackController.text;
            var feedBackModel =
                feedback_model.UserFeedback(email: email, feedback: feedback);

            setState(() {
              sendingFeedback = true;
            });

            var success =
                await AirqoApiClient(context).sendFeedback(feedBackModel);

            if (success) {
              setState(() {
                sendingFeedback = false;
              });

              await showDialog<void>(
                context: context,
                builder: (_) => SuccessDialog(),
              );
            } else {
              setState(() {
                sendingFeedback = false;
              });

              await showDialog<void>(
                context: context,
                builder: (_) => FailureDialog(),
              );
            }
          }
        },
        child: const Text(
          'Send',
          style: TextStyle(fontSize: 15.0),
        ),
      );
    }
  }

  Widget support() {
    return Container(
      padding: containerPadding(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Support',
            style: headerStyle(),
          ),
          InkWell(
            onTap: () {
              _launchURL('faqs');
            },
            child: ListTile(
              title: const Text('FAQs'),
              leading: Icon(
                Icons.help_outline_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('Contact Us');
            },
            child: ListTile(
              title: Text('Contact Us'),
              leading: Icon(
                Icons.contact_support_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('terms');
            },
            child: ListTile(
              title: const Text('Terms of Use & Privacy Policy'),
              leading: Icon(
                Icons.description,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('About');
            },
            child: ListTile(
              title: const Text('About AirQo'),
              leading: Icon(
                Icons.info_outline_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              _launchURL('rate');
            },
            child: ListTile(
              title: Text('Rate App'),
              leading: Icon(
                Icons.rate_review_outlined,
                color: ColorConstants().appColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _launchURL(String page) async {
    page = page.trim().toLowerCase();

    try {
      switch (page) {
        case 'faqs':
          await canLaunch(faqs)
              ? await launch(faqs)
              : throw 'Could not launch faqs, try opening $faqs';
          return;
        case 'about':
          await canLaunch(about)
              ? await launch(about)
              : throw 'Could not launch about, try opening $about';
          return;
        case 'contact us':
          await canLaunch(contactUs)
              ? await launch(contactUs)
              : throw 'Could not launch contact us, try opening $contactUs';
          return;
        case 'terms':
          await canLaunch(terms)
              ? await launch(terms)
              : throw 'Could not launch terms, try opening $terms';
          return;
        case 'rate':
          if (Platform.isAndroid) {
            await canLaunch(appPlayStoreLink)
                ? await launch(appPlayStoreLink)
                : throw 'Could not launch rate us, try opening'
                    ' $appPlayStoreLink';
          } else if (Platform.isIOS) {
            await canLaunch(appIOSLink)
                ? await launch(appIOSLink)
                : throw 'Could not launch rate us, try opening $appIOSLink';
          } else {
            await canLaunch(appPlayStoreLink)
                ? await launch(appPlayStoreLink)
                : throw 'Could not launch rate us, try opening'
                    ' $appPlayStoreLink';
          }
          return;
        case 'facebook':
          await canLaunch(facebook)
              ? await launch(facebook)
              : throw 'Could not launch facebook, try opening $facebook';
          return;
        case 'twitter':
          await canLaunch(twitter)
              ? await launch(twitter)
              : throw 'Could not launch twitter, try opening $twitter';
          return;
        case 'linkedin':
          await canLaunch(linkedin)
              ? await launch(linkedin)
              : throw 'Could not launch linkedin, try opening $linkedin';
          return;
        case 'youtube':
          await canLaunch(youtube)
              ? await launch(youtube)
              : throw 'Could not launch youtube, try opening $youtube';
          return;
        case 'airqo':
          await canLaunch(appWebsite)
              ? await launch(appWebsite)
              : throw 'Could not launch airqo, try opening $appWebsite';
          return;
        default:
          await canLaunch(appWebsite)
              ? await launch(appWebsite)
              : throw 'Could not launch airqo, try opening $appWebsite';
          return;
      }
    } catch (e) {
      print(e);
    }
  }
}
