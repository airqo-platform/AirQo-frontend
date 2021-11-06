import 'package:app/constants/app_constants.dart';
import 'package:app/models/feedback.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:flutter/rendering.dart';
import 'package:url_launcher/url_launcher.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({Key? key}) : super(key: key);

  @override
  _FeedbackPageState createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  int _index = 0;
  String feedbackType = '';
  String feedbackChannel = '';
  bool isSendingFeedback = false;
  final TextEditingController _emailInputController = TextEditingController();
  final TextEditingController _emailFeedbackController =
      TextEditingController();
  AirqoApiClient? _airqoApiClient;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: appTopBar(context, 'Send Feedback'),
        body: Container(
            padding: const EdgeInsets.only(left: 16, right: 16),
            color: ColorConstants.appBodyColor,
            child: Column(
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
                          color: feedbackType == ''
                              ? ColorConstants.greyColor
                              : ColorConstants.appColorBlue,
                          shape: BoxShape.circle),
                    ),
                    Expanded(
                        child: Divider(
                      thickness: 2,
                      color: _index >= 1
                          ? ColorConstants.appColorBlue
                          : ColorConstants.greyColor,
                    )),
                    Container(
                      height: 16,
                      width: 16,
                      decoration: BoxDecoration(
                          color: feedbackChannel != '' && _index >= 1
                              ? ColorConstants.appColorBlue
                              : ColorConstants.greyColor,
                          shape: BoxShape.circle),
                    ),
                    Expanded(
                        child: Divider(
                      thickness: 2,
                      color: _index >= 2 || feedbackChannel == 'WhatsApp'
                          ? ColorConstants.appColorBlue
                          : ColorConstants.greyColor,
                    )),
                    Container(
                      height: 16,
                      width: 16,
                      decoration: BoxDecoration(
                          color: _index >= 2 || feedbackChannel == 'WhatsApp'
                              ? ColorConstants.appColorBlue
                              : ColorConstants.greyColor,
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
                        const Text(
                          'What type of feedback?',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
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
                        const Text(
                          'Send us feedback via email or whatsapp',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        cardContainer('Email'),
                        const SizedBox(
                          height: 4,
                        ),
                        Visibility(
                          visible: feedbackChannel == 'Email',
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
                    visible: _index == 2 && feedbackChannel == 'Email',
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(
                          height: 32,
                        ),
                        const Text(
                          'Go ahead, tell us more?',
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(
                          height: 16,
                        ),
                        emailFeedbackInputField(),
                      ],
                    )),

                // Action buttons
                const Spacer(),
                Visibility(
                  visible: _index == 0,
                  child: GestureDetector(
                    onTap: () {
                      if (feedbackType != '') {
                        setState(() {
                          _index = 1;
                        });
                      }
                    },
                    child: feedbackType == ''
                        ? nextButton('Next', ColorConstants.appColorPaleBlue)
                        : nextButton('Next', ColorConstants.appColorBlue),
                  ),
                ),

                Visibility(
                  visible: _index > 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        child: containerBackButton(
                            'Back', ColorConstants.appColorPaleBlue),
                        onTap: () {
                          setState(() {
                            _index = _index - 1;
                          });
                        },
                      ),
                      GestureDetector(
                        onTap: () async {
                          if (_index == 1 && feedbackChannel != '') {
                            if (feedbackChannel == 'Email') {
                              if (!_emailInputController.text.isValidEmail()) {
                                await showSnackBar(context,
                                    'Please enter a valid email address');
                              } else {
                                setState(() {
                                  _index = _index + 1;
                                });
                              }
                            } else if (feedbackChannel == 'WhatsApp') {
                              try {
                                await launch('${Links.appWhatsappUrl}'
                                    'text=$feedbackType');
                              } catch (e) {
                                debugPrint(e.toString());
                              }
                              Navigator.of(context).pop();
                            }
                          } else if (_index == 2 &&
                              feedbackChannel == 'Email') {
                            if (_emailFeedbackController.text == '') {
                              await showSnackBar(
                                  context, 'Please provide your feedback');
                            } else {
                              var feedback = UserFeedback(
                                  _emailInputController.text,
                                  _emailFeedbackController.text,
                                  feedbackType);
                              setState(() {
                                isSendingFeedback = true;
                              });
                              await _airqoApiClient!
                                  .sendFeedback(feedback)
                                  .then((value) => {
                                        if (value)
                                          {
                                            showSnackBar(context,
                                                'Thanks for the feedback'),
                                            Navigator.of(context).pop(),
                                            setState(() {
                                              isSendingFeedback = false;
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
                                              isSendingFeedback = false;
                                            })
                                          }
                                      });
                            }
                          }
                        },
                        child: _index == 2 || feedbackChannel == 'WhatsApp'
                            ? containerNextButton(
                                'Send',
                                isSendingFeedback
                                    ? ColorConstants.appColorPaleBlue
                                    : ColorConstants.appColorBlue)
                            : containerNextButton(
                                'Next', ColorConstants.appColorBlue),
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
            feedbackType = text;
          });
        } else if (_index == 1) {
          setState(() {
            feedbackChannel = text;
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
              child: unselectedCircle(feedbackType == text),
            ),
            Visibility(
              visible: _index == 1,
              child: unselectedCircle(feedbackChannel == text),
            ),
            const SizedBox(
              width: 16,
            ),
            Text(
              text,
              style: const TextStyle(fontSize: 16),
            )
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
          enableSuggestions: false,
          cursorWidth: 1,
          maxLines: 12,
          cursorColor: ColorConstants.appColorBlue,
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
          decoration: const InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Please tell us the details',
          ),
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
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: ColorConstants.appColorBlue,
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
          ),
        )));
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    super.initState();
  }

  Widget unselectedCircle(bool isActive) {
    return Container(
      height: 24,
      width: 24,
      decoration: BoxDecoration(
          color: isActive ? ColorConstants.appColorBlue : Colors.white,
          shape: BoxShape.circle,
          border: isActive
              ? Border.all(color: ColorConstants.appColorBlue, width: 0)
              : Border.all(color: ColorConstants.greyColor, width: 3)),
    );
  }
}
