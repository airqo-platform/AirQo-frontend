import 'package:app/constants/app_constants.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final _phoneFormKey = GlobalKey<FormState>();
  bool phoneFormValid = false;
  bool codeFormValid = false;
  var phoneNumber = '';
  var emailAddress = '';
  var requestCode = false;
  var verifyId = '';
  var resendCode = false;
  var prefix = '+256(0) ';
  var prefixValue = '+256';
  var nextBtnColor = ColorConstants.appColorDisabled;
  final CustomAuth _customAuth = CustomAuth();
  final TextEditingController _phoneInputController = TextEditingController();
  final TextEditingController _emailInputController = TextEditingController();
  DateTime? exitTime;
  bool phoneSignUp = true;

  var smsCode = <String>['', '', '', '', '', ''];

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    _customAuth.logIn(credential).then((value) => {
          Navigator.pushAndRemoveUntil(context,
              MaterialPageRoute(builder: (context) {
            return HomePage();
          }), (r) => false)
        });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
      onWillPop: onWillPop,
      child: Container(
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
                      phoneSignUp
                          ? 'Enter the 6 digits code sent to your\n'
                              'number that ends with ...${phoneNumber.substring(phoneNumber.length - 3)}'
                          : 'Enter the 6 digit code sent to\n'
                              '$emailAddress',
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
                                      Navigator.pushAndRemoveUntil(context,
                                          MaterialPageRoute(builder: (context) {
                                        return HomePage();
                                      }), (r) => false)
                                    });
                          } on FirebaseAuthException catch (e) {
                            if (e.code == 'invalid-verification-code') {
                              await showSnackBar(context, 'Invalid Code');
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
                            await showSnackBar(context, 'Try again later');
                            print(e);
                          }
                        } else {
                          setState(() {
                            nextBtnColor = ColorConstants.appColorDisabled;
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
                    child: ListView(children: [
                      const SizedBox(
                        height: 42,
                      ),
                      const Text(
                        'Log in with your email\nor mobile number',
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
                      Visibility(
                        visible: phoneSignUp,
                        child: Container(
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
                      Visibility(
                        visible: !phoneSignUp,
                        child: emailInputField(),
                      ),
                      const SizedBox(
                        height: 36,
                      ),
                      Visibility(
                        visible: true,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              phoneSignUp = !phoneSignUp;
                              clearPhoneCallBack();
                              clearEmailCallBack();
                            });
                          },
                          child: signButton(phoneSignUp
                              ? 'Login with email instead'
                              : 'Login with a'
                                  ' mobile number instead'),
                        ),
                      ),
                      const SizedBox(
                        height: 212,
                      ),
                      GestureDetector(
                        onTap: () async {
                          _phoneFormKey.currentState!.validate();
                          if (phoneFormValid) {
                            setState(() {
                              nextBtnColor = ColorConstants.appColorDisabled;
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
                      loginOptions(context),
                      const SizedBox(
                        height: 36,
                      ),
                    ]))),
      ),
    ));
  }

  void clearEmailCallBack() {
    setState(() {
      emailAddress = '';
      _emailInputController.text = '';
      nextBtnColor = ColorConstants.appColorDisabled;
    });
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

  Widget emailInputField() {
    return Container(
        height: 48,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: ColorConstants.appColorBlue)),
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
                  onTap: clearEmailCallBack,
                  child: textInputCloseButton(),
                )),
          ),
        )));
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

      showSnackBar(context, 'Tap again to cancel !');
      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return HomePage();
    }), (r) => false);

    return Future.value(true);
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
