import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PhoneSignupScreen extends StatefulWidget {
  @override
  PhoneSignupScreenState createState() => PhoneSignupScreenState();
}

class PhoneSignupScreenState extends State<PhoneSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  var phoneNumber = '';
  var requestCode = false;
  var verifyId = '';
  var showRequestCode = false;
  var prefix = '+256(0) ';
  var prefixValue = '+256';
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  TextEditingController controller = TextEditingController();

  var smsCode = <String>['', '', '', '', '', ''];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: Container(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
              child: requestCode
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                          const SizedBox(
                            height: 42,
                          ),
                          const Text(
                            'Now enter the code',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 24,
                                color: Colors.black),
                          ),
                          const SizedBox(
                            height: 8,
                          ),
                          Text(
                            'Enter the 6 digit code sent via SMS, to '
                            '\nverify your account',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 14,
                                color: Colors.black.withOpacity(0.6)),
                          ),
                          const SizedBox(
                            height: 8,
                          ),
                          Container(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                optField(0, context, setCode),
                                optField(1, context, setCode),
                                optField(2, context, setCode),
                                optField(3, context, setCode),
                                optField(4, context, setCode),
                                optField(5, context, setCode)
                              ],
                            ),
                          ),
                          const SizedBox(
                            height: 24,
                          ),
                          Text(
                            'The code should arrive with in 5 sec.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 12,
                                color: Colors.black.withOpacity(0.5)),
                          ),
                          GestureDetector(
                            onTap: () async {
                              if (showRequestCode) {
                                await _customAuth.verifyPhone(
                                    phoneNumber, context, verifyPhoneFn);
                              }
                            },
                            child: Text(
                              'Resend code',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 12,
                                  color: showRequestCode
                                      ? ColorConstants.appColorBlue
                                      : Colors.black.withOpacity(0.5)),
                            ),
                          ),
                          const Spacer(),
                          GestureDetector(
                            onTap: () async {
                              var credential = PhoneAuthProvider.credential(
                                  verificationId: verifyId,
                                  smsCode: smsCode.join(''));
                              try {
                                await _customAuth
                                    .logIn(credential)
                                    .then((value) => {
                                          Navigator.pushReplacement(context,
                                              MaterialPageRoute(
                                                  builder: (context) {
                                            return ProfileSetupScreen();
                                          }))
                                        });
                              } on FirebaseAuthException catch (e) {
                                if (e.code == 'invalid-verification-code') {
                                  await showSnackBar(context, 'Invalid Code');
                                }
                                if (e.code == 'session-expired') {
                                  await _customAuth.verifyPhone(
                                      phoneNumber, context, verifyPhoneFn);
                                  await showSnackBar(
                                      context,
                                      ''
                                      'Your verification '
                                      'has timed out. we have sent your'
                                      ' another verification code');
                                }
                              } catch (e) {
                                await showSnackBar(context, 'Try again later');
                                print(e);
                              }
                            },
                            child: nextButton('Next'),
                          ),
                          const SizedBox(
                            height: 20,
                          ),
                          signUpOptions(context),
                          const SizedBox(
                            height: 36,
                          ),
                        ])
                  : Form(
                      key: _formKey,
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const SizedBox(
                              height: 42,
                            ),
                            const Text(
                              'Ok! What’s your mobile\nnumber?',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                  color: Colors.black),
                            ),
                            const SizedBox(
                              height: 4,
                            ),
                            Text(
                              'We’ll send you a verification code',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.black.withOpacity(0.6)),
                            ),
                            const SizedBox(
                              height: 32,
                            ),
                            Container(
                              height: 48,
                              child: Row(
                                children: [
                                  SizedBox(
                                    width: 64,
                                    child: countryPickerField(
                                        '+256', codeValueChange),
                                  ),
                                  const SizedBox(
                                    width: 16,
                                  ),
                                  Expanded(
                                    child: phoneInputField(
                                        '701000000',
                                        phoneValueChange,
                                        prefix,
                                        clearPhoneCallBack,
                                        controller),
                                  )
                                ],
                              ),
                            ),

                            // const SizedBox(
                            //   height: 36,
                            // ),
                            // GestureDetector(
                            //   onTap: () {
                            //     Navigator.push(context,
                            //         MaterialPageRoute(builder: (context) {
                            //           return EmailSignupScreen();
                            //         }));
                            //   },
                            //   child: signButton('Sign up with email instead'),
                            // ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () async {
                                if (_formKey.currentState!.validate()) {
                                  await _customAuth.verifyPhone(
                                      phoneNumber, context, verifyPhoneFn);
                                }
                              },
                              child: nextButton('Next'),
                            ),
                            const SizedBox(
                              height: 20,
                            ),
                            signUpOptions(context),
                            const SizedBox(
                              height: 36,
                            ),
                          ]))),
        ));
  }

  void clearPhoneCallBack() {
    setState(() {
      phoneNumber = '';
      controller.text = '';
    });
  }

  void codeValueChange(text) {
    setState(() {
      prefixValue = text;
      prefix = '$text(0) ';
    });
  }

  void initialize() {}

  @override
  void initState() {
    initialize();
    super.initState();
  }

  void phoneValueChange(text) {
    setState(() {
      phoneNumber = text;
    });
  }

  void setCode(value, position) {
    smsCode[position] = value;
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      requestCode = true;
      verifyId = verificationId;
    });

    Future.delayed(const Duration(seconds: 5), () async {
      setState(() {
        showRequestCode = true;
      });
    });
  }
}
