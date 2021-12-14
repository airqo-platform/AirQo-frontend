import 'package:app/constants/app_constants.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PhoneAuthWidget extends StatefulWidget {
  final bool enableBackButton;
  final ValueSetter<String> changeOption;
  final String action;

  const PhoneAuthWidget(this.enableBackButton, this.changeOption, this.action,
      {Key? key})
      : super(key: key);

  @override
  PhoneAuthWidgetState createState() => PhoneAuthWidgetState();
}

class PhoneAuthWidgetState extends State<PhoneAuthWidget> {
  bool _phoneFormValid = false;
  String _phoneNumber = '';
  bool _verifyCode = false;
  String _verificationId = '';
  bool _resendCode = false;
  bool _codeSent = false;
  bool _isResending = false;
  bool _isVerifying = false;
  String _countryCodePlaceHolder = '+256(0) ';
  String _countryCode = '+256';
  List<String> _phoneVerificationCode = <String>['', '', '', '', '', ''];
  Color _nextBtnColor = ColorConstants.appColorDisabled;

  final CustomAuth _customAuth = CustomAuth();
  final TextEditingController _phoneInputController = TextEditingController();
  final CloudStore _cloudStore = CloudStore();
  final _phoneFormKey = GlobalKey<FormState>();

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    if (widget.action == 'signup') {
      _customAuth.signUpWithPhoneNumber(credential).then((value) => {
            Navigator.pushAndRemoveUntil(context,
                MaterialPageRoute(builder: (context) {
              return ProfileSetupScreen(widget.enableBackButton);
            }), (r) => false)
          });
    } else {
      _customAuth.logInWithPhoneNumber(credential, context).then((value) => {
            Navigator.pushAndRemoveUntil(context,
                MaterialPageRoute(builder: (context) {
              return const HomePage();
            }), (r) => false)
          });
    }
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
          height: 56,
        ),

        Visibility(
          visible: _verifyCode,
          child: const Text(
            'Verify your phone number!',
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: Text(
            widget.action == 'signup'
                ? 'Sign up with your email\nor mobile number'
                : 'Login with your email\nor mobile number',
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),

        const SizedBox(
          height: 8,
        ),

        if (_phoneNumber.length > 8)
          Visibility(
            visible: _verifyCode,
            child: Text(
              // 'Enter the 6 digits code sent to your\n'
              //     'number that ends with ...'
              //     '${phoneNumber.substring(phoneNumber.length - 3)}',
              'Enter the 6 digits code sent to your\n'
              'number $_countryCode$_phoneNumber',
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            ),
          ),
        Visibility(
            visible: !_verifyCode,
            child: Text(
              'We’ll send you a verification code',
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            )),

        const SizedBox(
          height: 32,
        ),

        // End Common widgets

        Visibility(
          visible: _verifyCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: optField(0, context, setCode, _codeSent),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: Form(
            key: _phoneFormKey,
            child: SizedBox(
              height: 48,
              child: Row(
                children: [
                  SizedBox(
                    width: 64,
                    child: countryPickerField(
                        _countryCode, codeValueChange, context),
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
          height: 32,
        ),

        Visibility(
          visible: !_codeSent && _verifyCode,
          child: Text(
            'The code should arrive with in 5 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: _codeSent && _verifyCode,
          child: GestureDetector(
            onTap: () async {
              await resendVerificationCode();
            },
            child: Text(
              'Resend code',
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                  fontSize: 12,
                  color: _isResending
                      ? Colors.black.withOpacity(0.5)
                      : ColorConstants.appColorBlue),
            ),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: GestureDetector(
            onTap: () {
              setState(() {
                initialize();
                widget.changeOption('email');
              });
            },
            child: widget.action == 'signup'
                ? signButton('Sign up with an email instead')
                : signButton('Login with an email instead'),
          ),
        ),

        const SizedBox(
          height: 19,
        ),

        Visibility(
          visible: _verifyCode,
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
          visible: _verifyCode,
          child: const SizedBox(
            height: 19,
          ),
        ),
        Visibility(
          visible: _verifyCode,
          child: GestureDetector(
            onTap: initialize,
            child: Text(
              'Change Phone Number',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: _resendCode
                      ? ColorConstants.appColorBlue
                      : Colors.black.withOpacity(0.5)),
            ),
          ),
        ),

        const SizedBox(
          height: 212,
        ),
        Visibility(
          visible: _verifyCode,
          child: GestureDetector(
            onTap: () async {
              await verifySentCode();
            },
            child: nextButton('Next', _nextBtnColor),
          ),
        ),
        Visibility(
          visible: !_verifyCode,
          child: GestureDetector(
            onTap: () async {
              await requestVerification();
            },
            child: nextButton('Next', _nextBtnColor),
          ),
        ),
        const SizedBox(
          height: 16,
        ),
        Visibility(
          visible: widget.action == 'signup',
          child: signUpOptions(context),
        ),
        Visibility(
          visible: widget.action == 'login',
          child: loginOptions(context),
        ),
        const SizedBox(
          height: 36,
        ),
      ])),
    );
  }

  void clearPhoneCallBack() {
    setState(() {
      _phoneNumber = '';
      _phoneInputController.text = '';
      _nextBtnColor = ColorConstants.appColorDisabled;
    });
  }

  void codeValueChange(text) {
    setState(() {
      _countryCode = text;
      _countryCodePlaceHolder = '$text(0) ';
    });
  }

  void initialize() {
    setState(() {
      _phoneFormValid = false;
      _phoneNumber = '';
      _verifyCode = false;
      _verificationId = '';
      _resendCode = false;
      _codeSent = false;
      _isResending = false;
      _isVerifying = false;
      _countryCodePlaceHolder = '+256(0) ';
      _countryCode = '+256';
      _phoneVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = ColorConstants.appColorDisabled;
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
                _phoneFormValid = false;
              });
            } else {
              setState(() {
                _phoneFormValid = true;
              });
            }
            return null;
          },
          decoration: InputDecoration(
            prefixText: _countryCodePlaceHolder,
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
        _nextBtnColor = ColorConstants.appColorDisabled;
      });
    } else {
      setState(() {
        _nextBtnColor = ColorConstants.appColorBlue;
      });
    }

    setState(() {
      _phoneNumber = text;
    });
  }

  Future<void> requestVerification() async {
    var connected = await _customAuth.isConnected();
    if (!connected) {
      await showSnackBar(context, ErrorMessages.timeoutException);
      return;
    }
    _phoneFormKey.currentState!.validate();
    if (_phoneFormValid) {
      setState(() {
        _nextBtnColor = ColorConstants.appColorDisabled;
        _isVerifying = true;
        _codeSent = false;
      });

      // TODO implement phone number checking
      // if (widget.action == 'signup') {
      //   var phoneExists = await _customAuth.userExists(
      //       '$_countryCode$_phoneNumber', null);
      //   if (phoneExists) {
      //     await showSnackBar(
      //         context,
      //         'Phone number already taken. '
      //         'Try logging in');
      //     setState(() {
      //       _nextBtnColor = ColorConstants.appColorBlue;
      //       _isVerifying = false;
      //       _codeSent = false;
      //     });
      //     return;
      //   }
      // }

      await _customAuth.verifyPhone('$_countryCode$_phoneNumber', context,
          verifyPhoneFn, autoVerifyPhoneFn);

      Future.delayed(const Duration(seconds: 5), () {
        setState(() {
          _codeSent = true;
          _isVerifying = false;
        });
      });
    }
  }

  Future<void> resendVerificationCode() async {
    var connected = await _customAuth.isConnected();
    if (!connected) {
      await showSnackBar(context, ErrorMessages.timeoutException);
      return;
    }

    if (_isResending) {
      return;
    }

    setState(() {
      _isResending = true;
    });

    await _customAuth
        .verifyPhone('$_countryCode$_phoneNumber', context, verifyPhoneFn,
            autoVerifyPhoneFn)
        .then((value) => {
              setState(() {
                _isResending = false;
              })
            })
        .whenComplete(() => {
              setState(() {
                _isResending = false;
              })
            });
  }

  void setCode(value, position) {
    setState(() {
      _phoneVerificationCode[position] = value;
    });
    var code = _phoneVerificationCode.join('');
    if (code.length == 6) {
      setState(() {
        _nextBtnColor = ColorConstants.appColorBlue;
      });
    } else {
      setState(() {
        _nextBtnColor = ColorConstants.appColorDisabled;
      });
    }
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      _verifyCode = true;
      _verificationId = verificationId;
    });

    Future.delayed(const Duration(seconds: 5), () async {
      setState(() {
        _resendCode = true;
      });
    });
  }

  Future<void> verifySentCode() async {
    var connected = await _customAuth.isConnected();
    if (!connected) {
      await showSnackBar(context, ErrorMessages.timeoutException);
      return;
    }

    var code = _phoneVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(context, 'Enter all the 6 digits');
      return;
    }

    if (_isVerifying) {
      return;
    }

    setState(() {
      _nextBtnColor = ColorConstants.appColorDisabled;
      _isVerifying = true;
    });

    var credential = PhoneAuthProvider.credential(
        verificationId: _verificationId,
        smsCode: _phoneVerificationCode.join(''));
    try {
      if (widget.action == 'signup') {
        await _customAuth.signUpWithPhoneNumber(credential).then((value) => {
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (context) {
                return ProfileSetupScreen(widget.enableBackButton);
              }), (r) => false)
            });
      } else {
        await _customAuth
            .logInWithPhoneNumber(credential, context)
            .then((value) => {
                  Navigator.pushAndRemoveUntil(context,
                      MaterialPageRoute(builder: (context) {
                    return const HomePage();
                  }), (r) => false)
                });
      }
    } on FirebaseAuthException catch (e) {
      if (e.code == 'invalid-verification-code') {
        await showSnackBar(context, 'Invalid Code');
        setState(() {
          _nextBtnColor = ColorConstants.appColorBlue;
          _isVerifying = false;
        });
      }
      if (e.code == 'session-expired') {
        await _customAuth.verifyPhone('$_countryCode$_phoneNumber', context,
            verifyPhoneFn, autoVerifyPhoneFn);
        await showSnackBar(
            context,
            'Your verification '
            'has timed out. we have sent your'
            ' another verification code');
        setState(() {
          _nextBtnColor = ColorConstants.appColorBlue;
          _isVerifying = false;
        });
      }
    } catch (e) {
      await showSnackBar(context, 'Try again later');
      setState(() {
        _nextBtnColor = ColorConstants.appColorBlue;
        _isVerifying = false;
      });
      debugPrint(e.toString());
    }
  }
}
