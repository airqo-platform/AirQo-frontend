import 'dart:io';

import 'package:app/constants/config.dart';
import 'package:app/models/feedback.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/app_service.dart';
import '../themes/light_theme.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({Key? key}) : super(key: key);

  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  int _index = 0;
  String _feedbackType = '';
  String _feedbackChannel = '';
  bool _isSendingFeedback = false;
  final AppService _appService = AppService();
  final TextEditingController _emailInputController = TextEditingController();
  final TextEditingController _emailFeedbackController =
      TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: appTopBar(context: context, title: 'Send Feedback'),
        body: Container(
            padding: const EdgeInsets.only(left: 16, right: 16),
            color: Config.appBodyColor,
            child: Column(
              children: [
                ListView(
                  shrinkWrap: true,
                  children: [
                    const SizedBox(
                      height: 37,
                    ),
                    Row(
                      children: [
                        Container(
                          height: 16,
                          width: 16,
                          decoration: BoxDecoration(
                              color: _feedbackType == ''
                                  ? Config.greyColor
                                  : Config.appColorBlue,
                              shape: BoxShape.circle),
                        ),
                        Expanded(
                            child: Divider(
                          thickness: 2,
                          color: _index >= 1
                              ? Config.appColorBlue
                              : Config.greyColor,
                        )),
                        Container(
                          height: 16,
                          width: 16,
                          decoration: BoxDecoration(
                              color: _feedbackChannel != '' && _index >= 1
                                  ? Config.appColorBlue
                                  : Config.greyColor,
                              shape: BoxShape.circle),
                        ),
                        Expanded(
                            child: Divider(
                          thickness: 2,
                          color: _index >= 2 || _feedbackChannel == 'WhatsApp'
                              ? Config.appColorBlue
                              : Config.greyColor,
                        )),
                        Container(
                          height: 16,
                          width: 16,
                          decoration: BoxDecoration(
                              color:
                                  _index >= 2 || _feedbackChannel == 'WhatsApp'
                                      ? Config.appColorBlue
                                      : Config.greyColor,
                              shape: BoxShape.circle),
                        ),
                      ],
                    ),

                    // Step 0 (Feedback type)
                    Visibility(
                        visible: _index == 0,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(
                              height: 32,
                            ),
                            Text(
                              'What Type Of Feedback?',
                              style: CustomTextStyle.headline9(context),
                            ),
                            const SizedBox(
                              height: 16,
                            ),
                            cardContainer('Report air pollution'),
                            const SizedBox(
                              height: 4,
                            ),
                            cardContainer('Inquiry'),
                            const SizedBox(
                              height: 4,
                            ),
                            cardContainer('Suggestion'),
                            const SizedBox(
                              height: 4,
                            ),
                            cardContainer('App Bugs'),
                          ],
                        )),

                    // Step 1 (Feedback channel)
                    Visibility(
                        visible: _index == 1,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(
                              height: 32,
                            ),
                            Text(
                              'Send Us Feedback Via Email Or Whatsapp',
                              style: CustomTextStyle.headline9(context),
                            ),
                            const SizedBox(
                              height: 16,
                            ),
                            cardContainer('Email'),
                            const SizedBox(
                              height: 4,
                            ),
                            Visibility(
                              visible: _feedbackChannel == 'Email',
                              child: emailInputField(),
                            ),
                            const SizedBox(
                              height: 16,
                            ),
                            cardContainer('WhatsApp'),
                          ],
                        )),

                    // Step 2 (Email Feedback channel)
                    Visibility(
                        visible: _index == 2 && _feedbackChannel == 'Email',
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(
                              height: 32,
                            ),
                            Text(
                              'Go Ahead, Tell Us More?',
                              style: CustomTextStyle.headline9(context),
                            ),
                            const SizedBox(
                              height: 16,
                            ),
                            emailFeedbackInputField(),
                          ],
                        )),

                    // Action buttons
                    Visibility(
                      visible: false,
                      child: GestureDetector(
                        onTap: () {
                          if (_feedbackType != '') {
                            setState(() {
                              _index = 1;
                            });
                          }
                        },
                        child: _feedbackType == ''
                            ? nextButton('Next', Config.appColorPaleBlue)
                            : nextButton('Next', Config.appColorBlue),
                      ),
                    ),

                    Visibility(
                      visible: false,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          GestureDetector(
                            child: containerBackButton(
                                'Back', Config.appColorPaleBlue),
                            onTap: () {
                              setState(() {
                                _index = _index - 1;
                              });
                            },
                          ),
                          GestureDetector(
                            onTap: () async {
                              if (_index == 1 && _feedbackChannel != '') {
                                if (_feedbackChannel == 'Email') {
                                  if (!_emailInputController.text
                                      .isValidEmail()) {
                                    await showSnackBar(context,
                                        'Please enter a valid email address');
                                  } else {
                                    setState(() {
                                      _index = _index + 1;
                                    });
                                  }
                                } else if (_feedbackChannel == 'WhatsApp') {
                                  openWhatsapp();
                                  Future.delayed(const Duration(seconds: 2),
                                      () {
                                    Navigator.of(context).pop();
                                  });
                                }
                              } else if (_index == 2 &&
                                  _feedbackChannel == 'Email') {
                                if (_emailFeedbackController.text == '') {
                                  await showSnackBar(
                                      context, 'Please provide your feedback');
                                } else {
                                  var feedback = UserFeedback(
                                      _emailInputController.text,
                                      _emailFeedbackController.text,
                                      _feedbackType);
                                  setState(() {
                                    _isSendingFeedback = true;
                                  });
                                  await _appService.apiClient
                                      .sendFeedback(feedback)
                                      .then((value) => {
                                            if (value)
                                              {
                                                showSnackBar(context,
                                                    'Thanks for the feedback'),
                                                Navigator.of(context).pop(),
                                                setState(() {
                                                  _isSendingFeedback = false;
                                                })
                                              }
                                            else
                                              {
                                                showSnackBar(
                                                    context,
                                                    'Could not capture'
                                                    ' your feedback.'
                                                    ' Try again later'),
                                                setState(() {
                                                  _isSendingFeedback = false;
                                                })
                                              }
                                          });
                                }
                              }
                            },
                            child: _index == 2 || _feedbackChannel == 'WhatsApp'
                                ? containerNextButton(
                                    'Send',
                                    _isSendingFeedback
                                        ? Config.appColorPaleBlue
                                        : Config.appColorBlue)
                                : containerNextButton(
                                    'Next', Config.appColorBlue),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Visibility(
                  visible: _index == 0,
                  child: GestureDetector(
                    onTap: () {
                      if (_feedbackType != '') {
                        setState(() {
                          _index = 1;
                        });
                      }
                    },
                    child: _feedbackType == ''
                        ? nextButton('Next', Config.appColorPaleBlue)
                        : nextButton('Next', Config.appColorBlue),
                  ),
                ),
                Visibility(
                  visible: _index > 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        child: containerBackButton(
                            'Back', Config.appColorPaleBlue),
                        onTap: () {
                          setState(() {
                            _index = _index - 1;
                          });
                        },
                      ),
                      GestureDetector(
                        onTap: () async {
                          if (_index == 1 && _feedbackChannel != '') {
                            if (_feedbackChannel == 'Email') {
                              if (!_emailInputController.text.isValidEmail()) {
                                await showSnackBar(context,
                                    'Please enter a valid email address');
                              } else {
                                setState(() {
                                  _index = _index + 1;
                                });
                              }
                            } else if (_feedbackChannel == 'WhatsApp') {
                              openWhatsapp();
                              Future.delayed(const Duration(seconds: 2), () {
                                Navigator.of(context).pop();
                              });
                            }
                          } else if (_index == 2 &&
                              _feedbackChannel == 'Email') {
                            if (_emailFeedbackController.text == '') {
                              await showSnackBar(
                                  context, 'Please provide your feedback');
                            } else {
                              var feedback = UserFeedback(
                                  _emailInputController.text,
                                  _emailFeedbackController.text,
                                  _feedbackType);
                              setState(() {
                                _isSendingFeedback = true;
                              });
                              await _appService.apiClient
                                  .sendFeedback(feedback)
                                  .then((value) => {
                                        if (value)
                                          {
                                            showSnackBar(context,
                                                'Thanks for the feedback'),
                                            Navigator.of(context).pop(),
                                            setState(() {
                                              _isSendingFeedback = false;
                                            })
                                          }
                                        else
                                          {
                                            showSnackBar(
                                                context,
                                                'Could not capture'
                                                ' your feedback.'
                                                ' Try again later'),
                                            setState(() {
                                              _isSendingFeedback = false;
                                            })
                                          }
                                      });
                            }
                          }
                        },
                        child: _index == 2 || _feedbackChannel == 'WhatsApp'
                            ? containerNextButton(
                                'Send',
                                _isSendingFeedback
                                    ? Config.appColorPaleBlue
                                    : Config.appColorBlue)
                            : containerNextButton('Next', Config.appColorBlue),
                      )
                    ],
                  ),
                ),
                const SizedBox(
                  height: 37,
                ),
              ],
            )));
  }

  Widget cardContainer(text) {
    return GestureDetector(
      onTap: () {
        if (_index == 0) {
          setState(() {
            _feedbackType = text;
          });
        } else if (_index == 1) {
          setState(() {
            _feedbackChannel = text;
          });
        }
      },
      child: Container(
        padding: const EdgeInsets.only(left: 16, right: 16),
        height: 56,
        decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.all(Radius.circular(8.0))),
        child: Row(
          children: [
            Visibility(
              visible: _index == 0,
              child: unselectedCircle(_feedbackType == text),
            ),
            Visibility(
              visible: _index == 1,
              child: unselectedCircle(_feedbackChannel == text),
            ),
            const SizedBox(
              width: 16,
            ),
            Text(text, style: Theme.of(context).textTheme.bodyText1)
          ],
        ),
      ),
    );
  }

  Widget emailFeedbackInputField() {
    return Container(
        height: 255,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15, right: 15),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: Colors.white)),
        child: Center(
            child: TextFormField(
          controller: _emailFeedbackController,
          autofocus: true,
          style: Theme.of(context).textTheme.bodyText2,
          enableSuggestions: false,
          cursorWidth: 1,
          maxLines: 12,
          cursorColor: Config.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: (text) {},
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your email address');
            }
            if (!value!.isValidEmail()) {
              showSnackBar(context, 'Please enter a valid email address');
            }
            return null;
          },
          decoration: InputDecoration(
              focusedBorder: InputBorder.none,
              enabledBorder: InputBorder.none,
              hintText: 'Please tell us the details',
              hintStyle: Theme.of(context)
                  .textTheme
                  .bodyText2
                  ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
              counterStyle: Theme.of(context).textTheme.bodyText2),
        )));
  }

  Widget emailInputField() {
    return Container(
        height: 56,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: Colors.white)),
        child: Center(
            child: TextFormField(
          controller: _emailInputController,
          autofocus: true,
          style: Theme.of(context).textTheme.bodyText2,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: Config.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: (text) {},
          validator: (value) {
            return null;
          },
          decoration: InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Enter your email',
            suffixIcon: GestureDetector(
                onTap: () {
                  _emailInputController.text = '';
                },
                child: GestureDetector(
                  onTap: () {
                    _emailInputController.text = '';
                  },
                  child: textInputCloseButton(),
                )),
            hintStyle: Theme.of(context)
                .textTheme
                .bodyText2
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
          ),
        )));
  }

  void openWhatsapp() async {
    var androidUrl = '${Config.appAndroidWhatsappUrl}$_feedbackType';
    var iosUrl = '${Config.appIOSWhatsappUrl}${Uri.parse(_feedbackType)}';
    if (Platform.isIOS) {
      if (await canLaunch(iosUrl)) {
        await launch(iosUrl, forceSafariVC: false);
      } else {
        await showSnackBar(context, 'Whatsapp is not installed');
      }
    } else {
      if (await canLaunch(androidUrl)) {
        await launch(androidUrl);
      } else {
        await showSnackBar(context, 'Whatsapp is not installed');
      }
    }
  }

  Widget unselectedCircle(bool isActive) {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
          color: isActive ? Config.appColorBlue : Colors.white,
          shape: BoxShape.circle,
          border: isActive
              ? Border.all(color: Config.appColorBlue, width: 0)
              : Border.all(color: Config.greyColor, width: 3)),
    );
  }
}
