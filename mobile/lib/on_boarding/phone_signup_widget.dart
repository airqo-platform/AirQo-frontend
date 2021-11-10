import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/logger.dart';
import 'package:app/utils/string_extension.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PhoneSignupWidget extends StatefulWidget {
  final bool enableBackButton;
  final ValueSetter<String> changeOption;

  const PhoneSignupWidget(this.enableBackButton, this.changeOption, {Key? key})
      : super(key: key);

  @override
  PhoneSignupWidgetState createState() => PhoneSignupWidgetState();
}

class PhoneSignupWidgetState extends State<PhoneSignupWidget> {
  final _phoneFormKey = GlobalKey<FormState>();
  bool phoneFormValid = false;
  bool codeFormValid = false;
  var phoneNumber = '';
  var requestCode = false;
  var verifyId = '';
  var resendCode = false;
  var prefix = '+256(0) ';
  var prefixValue = '+256';
  var nextBtnColor = ColorConstants.appColorDisabled;
  final CustomAuth _customAuth = CustomAuth();
  final TextEditingController _phoneInputController = TextEditingController();
  final CloudStore _cloudStore = CloudStore();

  var smsCode = <String>['', '', '', '', '', ''];

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    _customAuth.signUpWithPhoneNumber(credential).then((value) => {
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return ProfileSetupScreen(widget.enableBackButton);
          }), (r) => false)
        });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
          child: ListView(children: [
        // Start Common widgets

        const SizedBox(
          height: 42,
        ),

        Visibility(
          visible: requestCode,
          child: const Text(
            'Verify your account!',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),
        Visibility(
          visible: !requestCode,
          child: const Text(
            'Sign up with your email\nor mobile number',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),

        const SizedBox(
          height: 8,
        ),

        if (phoneNumber != '')
          Visibility(
            visible: requestCode,
            child: Text(
              'Enter the 6 digits code sent to your\n'
              'number that ends with ...'
              '${phoneNumber.substring(phoneNumber.length - 3)}',
              textAlign: TextAlign.center,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            ),
          ),
        Visibility(
            visible: !requestCode,
            child: Text(
              'We’ll send you a verification code',
              textAlign: TextAlign.center,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            )),

        const SizedBox(
          height: 32,
        ),

        // End Common widgets

        Visibility(
          visible: requestCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: optField(0, context, setCode),
          ),
        ),
        Visibility(
          visible: !requestCode,
          child: Form(
            key: _phoneFormKey,
            child: SizedBox(
              height: 48,
              child: Row(
                children: [
                  SizedBox(
                    width: 64,
                    child: countryPickerField(
                        prefixValue, codeValueChange, context),
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
          ),
        ),

        const SizedBox(
          height: 24,
        ),

        Visibility(
          visible: !resendCode && requestCode,
          child: Text(
            'The code should arrive with in 5 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: requestCode,
          child: GestureDetector(
            onTap: () async {
              if (resendCode) {
                await resendVerificationCode();
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
        ),
        Visibility(
          visible: !requestCode,
          child: GestureDetector(
            onTap: () {
              setState(() {
                initialize();
                widget.changeOption('email');
              });
            },
            child: signButton('Sign up with '
                ' email instead'),
          ),
        ),

        const SizedBox(
          height: 19,
        ),

        Visibility(
          visible: requestCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: Stack(
              alignment: AlignmentDirectional.center,
              children: [
                Container(
                  height: 1.09,
                  color: Colors.black.withOpacity(0.05),
                ),
                Container(
                    color: Colors.white,
                    padding: const EdgeInsets.only(left: 5, right: 5),
                    child: const Text(
                      'Or',
                      style: TextStyle(fontSize: 12, color: Color(0xffD1D3D9)),
                    )),
              ],
            ),
          ),
        ),
        Visibility(
          visible: requestCode,
          child: const SizedBox(
            height: 19,
          ),
        ),
        Visibility(
          visible: requestCode,
          child: GestureDetector(
            onTap: initialize,
            child: Text(
              'Change Phone Number',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: resendCode
                      ? ColorConstants.appColorBlue
                      : Colors.black.withOpacity(0.5)),
            ),
          ),
        ),

        const SizedBox(
          height: 212,
        ),
        Visibility(
          visible: requestCode,
          child: GestureDetector(
            onTap: () async {
              await verifySentCode();
            },
            child: nextButton('Next', nextBtnColor),
          ),
        ),
        Visibility(
          visible: !requestCode,
          child: GestureDetector(
            onTap: () async {
              await requestVerification();
            },
            child: nextButton('Next', nextBtnColor),
          ),
        ),
        const SizedBox(
          height: 20,
        ),
        signUpOptions(context),
        const SizedBox(
          height: 36,
        ),
      ])),
    );
  }

  Widget builds(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
          child: requestCode
              ? ListView(children: [
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
                    'Enter the 6 digits code sent to your\n'
                    'number that ends with ...'
                    '${phoneNumber.substring(phoneNumber.length - 3)}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.6)),
                  ),
                  const SizedBox(
                    height: 8,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 36, right: 36),
                    child: optField(0, context, setCode),
                  ),
                  const SizedBox(
                    height: 24,
                  ),
                  Visibility(
                    visible: !resendCode,
                    child: Text(
                      'The code should arrive with in 5 sec',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 12, color: Colors.black.withOpacity(0.5)),
                    ),
                  ),
                  GestureDetector(
                    onTap: () async {
                      if (resendCode) {
                        await resendVerificationCode();
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
                    height: 19,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 36, right: 36),
                    child: Stack(
                      alignment: AlignmentDirectional.center,
                      children: [
                        Container(
                          height: 1.09,
                          color: Colors.black.withOpacity(0.05),
                        ),
                        Container(
                            color: Colors.white,
                            padding: const EdgeInsets.only(left: 5, right: 5),
                            child: const Text(
                              'Or',
                              style: TextStyle(
                                  fontSize: 12, color: Color(0xffD1D3D9)),
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(
                    height: 19,
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
                  const SizedBox(
                    height: 212,
                  ),
                  GestureDetector(
                    onTap: () async {
                      await verifySentCode();
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
              : ListView(children: [
                  const SizedBox(
                    height: 42,
                  ),
                  const Text(
                    'Sign up with your email\nor mobile number',
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
                    'We’ll send you a verification code',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: Colors.black.withOpacity(0.6)),
                  ),
                  const SizedBox(
                    height: 32,
                  ),
                  Form(
                    key: _phoneFormKey,
                    child: SizedBox(
                      height: 48,
                      child: Row(
                        children: [
                          SizedBox(
                            width: 64,
                            child: countryPickerField(
                                prefixValue, codeValueChange, context),
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
                  ),
                  const SizedBox(
                    height: 36,
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        widget.changeOption('email');
                      });
                    },
                    child: signButton('Sign up with email instead'),
                  ),
                  const SizedBox(
                    height: 212,
                  ),
                  GestureDetector(
                    onTap: () async {
                      await requestVerification();
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
                ])),
    );
  }

  void clearPhoneCallBack() {
    setState(() {
      phoneNumber = '';
      _phoneInputController.text = '';
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

  @override
  void initState() {
    initialize();
    super.initState();
  }

  Widget phoneInputField() {
    return Container(
        height: 48,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10.0)),
            border: Border.all(color: ColorConstants.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: _phoneInputController,
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
            //   borderSide: BorderSide(color: ColorConstants.appColorBlue,
            //   width: 1.0),
            //   borderRadius: BorderRadius.circular(10.0),
            // ),
            // enabledBorder: OutlineInputBorder(
            //   borderSide: BorderSide(color: ColorConstants.appColorBlue,
            //   width: 1.0),
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

  Future<void> requestVerification() async {
    _phoneFormKey.currentState!.validate();
    if (phoneFormValid) {
      var phoneExists =
          await _cloudStore.credentialsExist('$prefixValue$phoneNumber', null);
      if (phoneExists) {
        await showSnackBar(
            context,
            'Phone number already taken. '
            'Try logging in');
        return;
      }

      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
      await _customAuth.verifyPhone('$prefixValue$phoneNumber', context,
          verifyPhoneFn, autoVerifyPhoneFn);
    }
  }

  Future<void> resendVerificationCode() async {
    await _customAuth.verifyPhone(
        '$prefixValue$phoneNumber', context, verifyPhoneFn, autoVerifyPhoneFn);
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

  Future<void> verifySentCode() async {
    var code = smsCode.join('');
    if (code.length == 6) {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
      });

      var credential = PhoneAuthProvider.credential(
          verificationId: verifyId, smsCode: smsCode.join(''));
      try {
        await _customAuth.signUpWithPhoneNumber(credential).then((value) => {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return ProfileSetupScreen(widget.enableBackButton);
              }), (r) => false)
            });
      } on FirebaseAuthException catch (e) {
        if (e.code == 'invalid-verification-code') {
          await showSnackBar(context, 'Invalid Code');
        }
        if (e.code == 'session-expired') {
          await _customAuth.verifyPhone('$prefixValue$phoneNumber', context,
              verifyPhoneFn, autoVerifyPhoneFn);
          await showSnackBar(
              context,
              'Your verification '
              'has timed out. we have sent your'
              ' another verification code');
        }
      } catch (e) {
        await showSnackBar(context, 'Try again later');
        debugPrint(e.toString());
      }
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
      await showSnackBar(context, 'Enter all the 6 code digits');
    }
  }
}
