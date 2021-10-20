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
  final bool enableBackButton;
  PhoneSignupScreen(this.enableBackButton);

  @override
  PhoneSignupScreenState createState() =>
      PhoneSignupScreenState(enableBackButton);
}

class PhoneSignupScreenState extends State<PhoneSignupScreen> {
  final bool enableBackButton;
  final _phoneFormKey = GlobalKey<FormState>();
  final _codeFormKey = GlobalKey<FormState>();
  bool phoneFormValid = false;
  bool codeFormValid = false;
  var phoneNumber = '';
  var requestCode = false;
  var verifyId = '';
  var resendCode = false;
  var prefix = '+256(0) ';
  var prefixValue = '+256';
  var nextBtnColor = ColorConstants.appColorDisabled;
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  TextEditingController controller = TextEditingController();
  DateTime? exitTime;

  var smsCode = <String>['', '', '', '', '', ''];

  PhoneSignupScreenState(this.enableBackButton);

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    _customAuth.logIn(credential).then((value) => {
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return ProfileSetupScreen();
          }), (r) => false)
        });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        body: WillPopScope(
          onWillPop: onWillPop,
          child: Container(
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
                              'Verify your account!',
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
                              'Enter the 6 digit code sent to\n'
                              ' $prefixValue$phoneNumber\n'
                              ' to verify your account',
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
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
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
                                if (resendCode) {
                                  await _customAuth.verifyPhone(
                                      '$prefixValue$phoneNumber',
                                      context,
                                      verifyPhoneFn,
                                      autoVerifyPhoneFn);
                                }
                              },
                              child: Text(
                                'Resend code',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 12,
                                    color: resendCode
                                        ? ColorConstants.appColorBlue
                                        : Colors.black.withOpacity(0.5)),
                              ),
                            ),
                            const SizedBox(
                              height: 24,
                            ),
                            GestureDetector(
                              onTap: initialize,
                              child: Text(
                                'Change Number',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 12,
                                    color: resendCode
                                        ? ColorConstants.appColorBlue
                                        : Colors.black.withOpacity(0.5)),
                              ),
                            ),
                            const Spacer(),
                            GestureDetector(
                              onTap: () async {
                                var code = smsCode.join('');
                                if (code.length == 6) {
                                  setState(() {
                                    nextBtnColor = ColorConstants.appColorBlue;
                                  });

                                  var credential = PhoneAuthProvider.credential(
                                      verificationId: verifyId,
                                      smsCode: smsCode.join(''));
                                  try {
                                    await _customAuth
                                        .logIn(credential)
                                        .then((value) => {
                                              Navigator.pushAndRemoveUntil(
                                                  context, MaterialPageRoute(
                                                      builder: (context) {
                                                return ProfileSetupScreen();
                                              }), (r) => false)
                                            });
                                  } on FirebaseAuthException catch (e) {
                                    if (e.code == 'invalid-verification-code') {
                                      await showSnackBar(
                                          context, 'Invalid Code');
                                    }
                                    if (e.code == 'session-expired') {
                                      await _customAuth.verifyPhone(
                                          '$prefixValue$phoneNumber',
                                          context,
                                          verifyPhoneFn,
                                          autoVerifyPhoneFn);
                                      await showSnackBar(
                                          context,
                                          'Your verification '
                                          'has timed out. we have sent your'
                                          ' another verification code');
                                    }
                                  } catch (e) {
                                    await showSnackBar(
                                        context, 'Try again later');
                                    print(e);
                                  }
                                } else {
                                  setState(() {
                                    nextBtnColor =
                                        ColorConstants.appColorDisabled;
                                  });
                                  await showSnackBar(
                                      context, 'Enter all the code digits');
                                }
                              },
                              child: nextButton('Next', nextBtnColor),
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
                        key: _phoneFormKey,
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const SizedBox(
                                height: 42,
                              ),
                              const Text(
                                'Sign up with your mobile\nnumber',
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
                                          prefixValue, codeValueChange),
                                    ),
                                    const SizedBox(
                                      width: 16,
                                    ),
                                    Expanded(
                                      child: phoneInputField(),
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
                              //   child: signButton('Sign up with
                              //   email instead'),
                              // ),
                              const Spacer(),
                              GestureDetector(
                                onTap: () async {
                                  _phoneFormKey.currentState!.validate();
                                  if (phoneFormValid) {
                                    setState(() {
                                      nextBtnColor =
                                          ColorConstants.appColorDisabled;
                                    });
                                    await _customAuth.verifyPhone(
                                        '$prefixValue$phoneNumber',
                                        context,
                                        verifyPhoneFn,
                                        autoVerifyPhoneFn);
                                  }
                                },
                                child: nextButton('Next', nextBtnColor),
                              ),
                              const SizedBox(
                                height: 20,
                              ),
                              signUpOptions(context),
                              const SizedBox(
                                height: 36,
                              ),
                            ]))),
          ),
        ));
  }

  void clearPhoneCallBack() {
    setState(() {
      phoneNumber = '';
      controller.text = '';
      nextBtnColor = ColorConstants.appColorDisabled;
    });
  }

  void codeValueChange(text) {
    setState(() {
      prefixValue = text;
      prefix = '$text(0) ';
    });
  }

  void initialize() {
    setState(() {
      phoneFormValid = false;
      codeFormValid = false;
      requestCode = false;
      resendCode = false;
      nextBtnColor = ColorConstants.appColorDisabled;
    });
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to exit !');
      return Future.value(false);
    }
    return Future.value(true);
  }

  Widget phoneInputField() {
    return Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10.0)),
            border: Border.all(color: ColorConstants.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: controller,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: ColorConstants.appColorBlue,
          keyboardType: TextInputType.number,
          onChanged: phoneValueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your phone number');
              setState(() {
                phoneFormValid = false;
              });
            } else {
              setState(() {
                phoneFormValid = true;
              });
            }
            return null;
          },
          decoration: InputDecoration(
            prefixText: prefix,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            // focusedBorder: OutlineInputBorder(
            //   borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
            //   borderRadius: BorderRadius.circular(10.0),
            // ),
            // enabledBorder: OutlineInputBorder(
            //   borderSide: BorderSide(color: ColorConstants.appColorBlue, width: 1.0),
            //   borderRadius: BorderRadius.circular(10.0),
            // ),
            hintText: '701000000',
            suffixIcon: GestureDetector(
              onTap: clearPhoneCallBack,
              child: textInputCloseButton(),
            ),
          ),
        )));
  }

  void phoneValueChange(text) {
    if (text.toString().isEmpty) {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
      });
    }

    setState(() {
      phoneNumber = text;
    });
  }

  void setCode(value, position) {
    setState(() {
      smsCode[position] = value;
    });
    var code = smsCode.join('');
    if (code.length == 6) {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
      });
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
    }
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      requestCode = true;
      verifyId = verificationId;
    });

    Future.delayed(const Duration(seconds: 5), () async {
      setState(() {
        resendCode = true;
      });
    });
  }
}
