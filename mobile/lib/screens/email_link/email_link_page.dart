// ignore_for_file: use_build_context_synchronously

import 'package:app/screens/email_link/confirm_account_details.dart';
import 'package:app/screens/email_link/email_link_widgets.dart';
import 'package:app/screens/quiz/quiz_view.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:app/themes/theme.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<dynamic> bottomSheetEmailLink(BuildContext context) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  bool shouldShowBottomSheet = true;
  int remindMeLaterTimestamp = prefs.getInt('remindMeLaterTimestamp') ?? 0;

  if (remindMeLaterTimestamp > 0) {
    DateTime lastRemindTimestamp =
        DateTime.fromMillisecondsSinceEpoch(remindMeLaterTimestamp);
    DateTime now = DateTime.now();
    if (now.difference(lastRemindTimestamp).inDays < 3) {
      shouldShowBottomSheet = false;
    }
  }
  if (shouldShowBottomSheet) {
    return showModalBottomSheet(
      isScrollControlled: true,
      enableDrag: false,
      elevation: 1,
      transitionAnimationController: bottomSheetTransition(context),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      isDismissible: false,
      context: context,
      builder: (context) {
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.9,
          child: AnimatedPadding(
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeIn,
            padding: const EdgeInsets.fromLTRB(0, 2, 0, 10),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 3),
                SizedBox(
                  height: 215,
                  width: 373,
                  child: AnimatedPadding(
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeIn,
                    padding: const EdgeInsets.fromLTRB(4, 4, 4, 10),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.asset(
                        'assets/images/email_link.png',
                        fit: BoxFit.cover,
                        height: double.infinity,
                        width: double.infinity,
                        alignment: Alignment.center,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                AnimatedPadding(
                  duration: const Duration(milliseconds: 500),
                  curve: Curves.easeIn,
                  padding: const EdgeInsets.fromLTRB(30, 0, 30, 20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 295.53,
                        height: 67,
                        child: AutoSizeText(
                          "We are shuffling things around for you.....",
                          //maxLines: 2,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: CustomColors.quizColorBlack,
                            fontWeight: FontWeight.w700,
                            fontSize: 19.58,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: 271,
                        height: 67,
                        child: RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            children: [
                              const TextSpan(
                                text:
                                    " You would be required to add your email to your profile on the mobile app to enable you access the ",
                                style: TextStyle(
                                  color: Color(0xFF485972),
                                  fontSize: 13.24,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              TextSpan(
                                text: "AirQo analytics",
                                style: TextStyle(
                                  color: CustomColors.appColorBlue,
                                  fontSize: 13.24,
                                  fontWeight: FontWeight.w400,
                                  decoration: TextDecoration.underline,
                                ),
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () async {
                                    Uri url =
                                        Uri.parse('https://platform.airqo.net');
                                    if (await canLaunchUrl(url)) {
                                      await launchUrl(
                                        url,
                                        mode: LaunchMode.platformDefault,
                                      );
                                    } else {
                                      throw 'Could not launch $url';
                                    }
                                  },
                              ),
                              const TextSpan(
                                text: " with one account.",
                                style: TextStyle(
                                  color: Color(0xFF485972),
                                  fontSize: 13.24,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      InkWell(
                        onTap: () async {
                          Navigator.push(context, MaterialPageRoute(
                            builder: (context) {
                              return const EmailLinkScreen();
                            },
                          ));
                        },
                        child: const EmailLinkActionButton(
                          text: "Add my email",
                        ),
                      ),
                      const SizedBox(height: 10),
                      InkWell(
                        onTap: () async {
                          Navigator.pop(context, false);
                          // Update the timestamp when "Remind me later" is clicked
                          prefs.setInt(
                            'remindMeLaterTimestamp',
                            DateTime.now().millisecondsSinceEpoch,
                          );
                        },
                        child: const EmailLinkSkipButton(
                          text: "Remind me later",
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
}
