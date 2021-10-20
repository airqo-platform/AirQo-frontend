import 'package:app/constants/app_constants.dart';
import 'package:app/models/userDetails.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/native_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'home_page.dart';

class SignUpPage extends StatefulWidget {
  SignUpPage();

  @override
  SignUpPageState createState() => SignUpPageState();
}

class SignUpPageState extends State<SignUpPage> {
  final _phoneFormKey = GlobalKey<FormState>();
  final _codeFormKey = GlobalKey<FormState>();
  bool phoneFormValid = false;
  bool codeFormValid = false;
  var phoneNumber = '';
  final _formKey = GlobalKey<FormState>();

  var verifyId = '';
  var resendCode = false;
  var prefix = '+256(0) ';
  var prefixValue = '+256';
  var nextBtnColor = ColorConstants.appColorDisabled;
  final CustomAuth _customAuth = CustomAuth(FirebaseAuth.instance);
  TextEditingController controller = TextEditingController();

  var smsCode = <String>['', '', '', '', '', ''];

  String activeWidget = 'phone_signup_widget';
  bool isLoading = false;
  bool nameFormValid = false;
  String fullName = '';

  DateTime? exitTime;

  SignUpPageState();

  Future<void> actionPhoneSignUp() async {
    setState(() {
      nextBtnColor = ColorConstants.appColorDisabled;
      isLoading = true;
    });

    await _customAuth.verifyPhone(
        '$prefixValue$phoneNumber', context, verifyPhoneFn, autoVerifyPhoneFn);
  }

  Future<void> actionSaveName() async {
    try {
      if (nameFormValid && !isLoading) {
        setState(() {
          nextBtnColor = ColorConstants.appColorDisabled;
          isLoading = true;
        });
        var userDetails = UserDetails.initialize()
          ..firstName = UserDetails.getNames(fullName).first
          ..lastName = UserDetails.getNames(fullName).last;

        await _customAuth
            .updateProfile(userDetails)
            .then((value) => {switchWidget('location_widget', false)});
      }
    } on FirebaseAuthException catch (e) {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
        isLoading = false;
      });
      await showSnackBar(context, 'Failed to update profile. Try again later');
      print(e);
    }
  }

  Future<void> actionVerifyCode() async {
    var code = smsCode.join('');
    if (code.length == 6) {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
        isLoading = true;
      });

      var credential = PhoneAuthProvider.credential(
          verificationId: verifyId, smsCode: smsCode.join(''));
      try {
        await _customAuth
            .logIn(credential)
            .then((value) => {switchWidget('name_widget', true)});
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
        print(e);
      }
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
      await showSnackBar(context, 'Enter all the code digits');
    }
  }

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    print('Auto verification');
    _customAuth
        .logIn(credential)
        .then((value) => {switchWidget('name_widget', true)});
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
              child: getWidget(),
            ),
          ),
        ));
  }

  Widget cancelWidget() {
    return GestureDetector(
      onTap: () {
        Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return HomePage();
        }), (r) => false);
      },
      child: Text(
        'Cancel',
        textAlign: TextAlign.center,
        style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: ColorConstants.appColorBlue),
      ),
    );
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

  Widget finalWidget() {
    return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'All Set!',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 48, color: Colors.black),
          ),
          Text(
            'Breathe',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 48,
                color: ColorConstants.appColorBlue),
          ),
        ]);
  }

  Widget getWidget() {
    switch (activeWidget) {
      case 'phone_signup_widget':
        return phoneSignUpWidget();
      case 'request_code_widget':
        return verificationCodeWidget();
      case 'name_widget':
        return nameWidget();
      case 'location_widget':
        return locationWidget();
      case 'notification_widget':
        return notificationWidget();
      case 'final_widget':
        return finalWidget();
      default:
        return phoneSignUpWidget();
    }
  }

  void initialize() {
    setState(() {
      phoneFormValid = false;
      codeFormValid = false;
      resendCode = false;
      nextBtnColor = ColorConstants.appColorDisabled;
    });
  }

  Widget locationWidget() {
    return Center(
      child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
        const SizedBox(
          height: 140,
        ),
        locationIcon(143.0, 143.0),
        const SizedBox(
          height: 52,
        ),
        const Text(
          'Enable locations',
          textAlign: TextAlign.center,
          style: TextStyle(
              fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
        ),
        const SizedBox(
          height: 8,
        ),
        const Text(
          'Allow AirQo to send you location air '
          'quality\n update for your work place, home',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: Colors.black),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () {
            LocationService()
                .getLocation()
                .then((value) => {switchWidget('notification_widget', false)});
          },
          child: nextButton('Allow location', ColorConstants.appColorBlue),
        ),
        const SizedBox(
          height: 20,
        ),
        cancelWidget(),
        const SizedBox(
          height: 36,
        ),
      ]),
    );
  }

  Widget nameInputField() {
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
          keyboardType: TextInputType.name,
          onChanged: (text) {
            if (text.toString().isEmpty || text.toString() == '') {
              setState(() {
                nextBtnColor = ColorConstants.appColorDisabled;
              });
            } else {
              setState(() {
                nextBtnColor = ColorConstants.appColorBlue;
              });
            }
            setState(() {
              fullName = text;
            });
          },
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your name');
              setState(() {
                nameFormValid = false;
              });
            } else if (value.length > 15) {
              showSnackBar(context, 'Maximum number of characters is 15');
              setState(() {
                nameFormValid = false;
              });
            } else {
              setState(() {
                nameFormValid = true;
              });
            }

            return null;
          },
          decoration: const InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Enter your name',
          ),
        )));
  }

  Widget nameWidget() {
    return Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
      const SizedBox(
        height: 42,
      ),
      const Text(
        'Great!\nWhat’s your name?',
        textAlign: TextAlign.center,
        style: TextStyle(
            fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
      ),
      const SizedBox(
        height: 42,
      ),
      Container(
        height: 48,
        child: Row(
          children: <Widget>[
            // titleDropdown(),
            // const SizedBox(
            //   width: 16,
            // ),
            Form(
              key: _formKey,
              child: Flexible(
                child: nameInputField(),
              ),
            ),
          ],
        ),
      ),
      const Spacer(),
      GestureDetector(
        onTap: () async {
          if (_formKey.currentState!.validate()) {
            await actionSaveName();
          }
        },
        child: nextButton('Let’s go', nextBtnColor),
      ),
      const SizedBox(
        height: 20,
      ),
      cancelWidget(),
      const SizedBox(
        height: 36,
      ),
    ]);
  }

  Widget notificationWidget() {
    return Center(
      child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
        const SizedBox(
          height: 140,
        ),
        notificationIcon(100.0, 100.0),
        const SizedBox(
          height: 52,
        ),
        const Text(
          'Know your air in real time',
          textAlign: TextAlign.center,
          style: TextStyle(
              fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
        ),
        const SizedBox(
          height: 8,
        ),
        const Text(
          'Allow AirQo push notifications to receive'
          '\nair quality updates.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: Colors.black),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () {
            NotificationService()
                .requestPermission()
                .then((value) => {switchWidget('final_widget', false)});
          },
          child: nextButton('Allow notifications', ColorConstants.appColorBlue),
        ),
        const SizedBox(
          height: 20,
        ),
        cancelWidget(),
        const SizedBox(
          height: 36,
        ),
      ]),
    );
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (exitTime == null ||
        now.difference(exitTime!) > const Duration(seconds: 2)) {
      exitTime = now;

      showSnackBar(context, 'Tap again to cancel!');
      return Future.value(false);
    }

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return HomePage();
    }), (r) => false);

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

  // switch widgets
  Widget phoneSignUpWidget() {
    return Form(
        key: _phoneFormKey,
        child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          const SizedBox(
            height: 42,
          ),
          const Text(
            'Sign up with your mobile\nnumber',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
          const SizedBox(
            height: 4,
          ),
          Text(
            'We’ll send you a verification code',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
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
                  child: countryPickerField(prefixValue, codeValueChange),
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
          //   child: signButton('Sign up with email instead'),
          // ),
          const Spacer(),
          GestureDetector(
            onTap: () async {
              _phoneFormKey.currentState!.validate();
              if (phoneFormValid && !isLoading) {
                await actionPhoneSignUp();
              }
            },
            child: nextButton('Next', nextBtnColor),
          ),
          const SizedBox(
            height: 20,
          ),
          cancelWidget(),
          const SizedBox(
            height: 36,
          ),
        ]));
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

  void switchWidget(name, bool disableButton) {
    setState(() {
      activeWidget = name;
      isLoading = false;
      controller.text = '';
    });

    if (disableButton) {
      setState(() {
        nextBtnColor = ColorConstants.appColorDisabled;
      });
    } else {
      setState(() {
        nextBtnColor = ColorConstants.appColorBlue;
      });
    }

    if (name == 'final_widget') {
      Future.delayed(const Duration(seconds: 4), () async {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return HomePage();
        }), (r) => false);
      });
    }
  }

  Widget verificationCodeWidget() {
    return Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
      const SizedBox(
        height: 42,
      ),
      const Text(
        'Verify your account!',
        textAlign: TextAlign.center,
        style: TextStyle(
            fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
      ),
      const SizedBox(
        height: 8,
      ),
      Text(
        'Enter the 6 digit code sent to\n'
        ' $prefixValue$phoneNumber\n'
        ' to verify your account',
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
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
        style: TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
      ),
      GestureDetector(
        onTap: () async {
          if (resendCode) {
            await _customAuth.verifyPhone('$prefixValue$phoneNumber', context,
                verifyPhoneFn, autoVerifyPhoneFn);
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
        onTap: () {
          switchWidget('phone_signup_widget', true);
        },
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
          await actionVerifyCode();
        },
        child: nextButton('Next', nextBtnColor),
      ),
      const SizedBox(
        height: 20,
      ),
      cancelWidget(),
      const SizedBox(
        height: 36,
      ),
    ]);
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      verifyId = verificationId;
      switchWidget('request_code_widget', true);
    });

    Future.delayed(const Duration(seconds: 5), () async {
      setState(() {
        resendCode = true;
      });
    });
  }
}
