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
    fillColor: ColorConstants().appColor,
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
    child: const Padding(
      padding: EdgeInsets.all(4),
      child: Text(
        'Close',
        style: TextStyle(color: Colors.white),
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
                Flexible(
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: Text(
                      'Oops! Something went wrong, try again later',
                      softWrap: true,
                      style: TextStyle(
                        color: ColorConstants().appColor,
                      ),
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
                Flexible(
                  child: Padding(
                    padding: EdgeInsets.all(10),
                    child: Text(
                      'Thanks for your feedback.'
                      ' The AirQo team shall address it asap',
                      softWrap: true,
                      style: TextStyle(
                        color: ColorConstants().appColor,
                      ),
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

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'AirQo',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
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
      style: TextStyle(color: ColorConstants().appColor),
      autofocus: true,
      controller: feedbackController,
      decoration: InputDecoration(
          labelText: 'Feedback',
          hintText: 'Share your feedback to enable us make improvements.',
          labelStyle: TextStyle(
            color: ColorConstants().appColor,
          ),
          hintStyle: TextStyle(color: ColorConstants().appColor)),
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
                  icon: FaIcon(
                    FontAwesomeIcons.facebook,
                    size: 30,
                    color: ColorConstants().facebookColor,
                  ),
                  onPressed: () {
                    _launchURL('facebook');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.twitter,
                    size: 30,
                    color: ColorConstants().twitterColor,
                  ),
                  onPressed: () {
                    _launchURL('twitter');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.youtube,
                    size: 30,
                    color: ColorConstants().youtubeColor,
                  ),
                  onPressed: () {
                    _launchURL('youtube');
                  }),
              IconButton(
                  icon: FaIcon(
                    FontAwesomeIcons.linkedin,
                    size: 30,
                    color: ColorConstants().linkedInColor,
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
            'v2.0.1',
            style: TextStyle(color: ColorConstants().appColor),
          )
        ],
      ),
    );
  }

  TextStyle headerStyle() {
    return TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 20,
        color: ColorConstants().appColor);
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
              title: Text(
                'FAQs',
                style: TextStyle(color: ColorConstants().appColor),
              ),
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
              title: Text(
                'Contact Us',
                style: TextStyle(color: ColorConstants().appColor),
              ),
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
              title: Text(
                'Terms of Use & Privacy Policy',
                style: TextStyle(color: ColorConstants().appColor),
              ),
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
              title: Text(
                'About AirQo',
                style: TextStyle(color: ColorConstants().appColor),
              ),
              leading: Icon(
                Icons.info_outline_rounded,
                color: ColorConstants().appColor,
              ),
            ),
          ),
          // InkWell(
          //   onTap: () {
          //     _launchURL('rate');
          //   },
          //   child: ListTile(
          //     title: Text(
          //       'Rate App',
          //       style: TextStyle(color: ColorConstants().appColor),
          //     ),
          //     leading: Icon(
          //       Icons.rate_review_outlined,
          //       color: ColorConstants().appColor,
          //     ),
          //   ),
          // ),
        ],
      ),
    );
  }

  Future<void> _launchURL(String page) async {
    page = page.trim().toLowerCase();

    try {
      switch (page) {
        case 'faqs':
          await canLaunch(Links().faqs)
              ? await launch(Links().faqs)
              : throw 'Could not launch faqs, try opening ${Links().faqs}';
          return;
        case 'about':
          await canLaunch(Links().about)
              ? await launch(Links().about)
              : throw 'Could not launch about, try opening ${Links().about}';
          return;
        case 'contact us':
          await canLaunch(Links().contactUs)
              ? await launch(Links().contactUs)
              : throw 'Could not launch contact us, try opening ${Links().contactUs}';
          return;
        case 'terms':
          await canLaunch(Links().terms)
              ? await launch(Links().terms)
              : throw 'Could not launch terms, try opening ${Links().terms}';
          return;
        case 'rate':
          if (Platform.isAndroid) {
            await canLaunch(Links().playStoreLink)
                ? await launch(Links().playStoreLink)
                : throw 'Could not launch rate us, try opening'
                    ' ${Links().playStoreLink}';
          } else if (Platform.isIOS) {
            await canLaunch(Links().iOSLink)
                ? await launch(Links().iOSLink)
                : throw 'Could not launch rate us, try opening ${Links().iOSLink}';
          } else {
            await canLaunch(Links().playStoreLink)
                ? await launch(Links().playStoreLink)
                : throw 'Could not launch rate us, try opening'
                    ' ${Links().playStoreLink}';
          }
          return;
        case 'facebook':
          await canLaunch(Links().facebook)
              ? await launch(Links().facebook)
              : throw 'Could not launch facebook, try opening ${Links().facebook}';
          return;
        case 'twitter':
          await canLaunch(Links().twitter)
              ? await launch(Links().twitter)
              : throw 'Could not launch twitter, try opening ${Links().twitter}';
          return;
        case 'linkedin':
          await canLaunch(Links().linkedin)
              ? await launch(Links().linkedin)
              : throw 'Could not launch linkedin, try opening ${Links().linkedin}';
          return;
        case 'youtube':
          await canLaunch(Links().youtube)
              ? await launch(Links().youtube)
              : throw 'Could not launch youtube, try opening ${Links().youtube}';
          return;
        case 'airqo':
          await canLaunch(Links().airqoWebsite)
              ? await launch(Links().airqoWebsite)
              : throw 'Could not launch airqo, try opening ${Links().airqoWebsite}';
          return;
        default:
          await canLaunch(Links().airqoWebsite)
              ? await launch(Links().airqoWebsite)
              : throw 'Could not launch airqo, try opening ${Links().airqoWebsite}';
          return;
      }
    } catch (e) {
      print(e);
    }
  }
}
