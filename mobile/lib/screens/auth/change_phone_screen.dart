import 'package:app/constants/config.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/network.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class ChangePhoneScreen extends StatefulWidget {
  const ChangePhoneScreen({Key? key}) : super(key: key);

  @override
  ChangePhoneScreenState createState() => ChangePhoneScreenState();
}

class ChangePhoneScreenState extends State<ChangePhoneScreen> {
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
  Color _nextBtnColor = Config.appColorDisabled;

  final TextEditingController _phoneInputController = TextEditingController();
  final _phoneFormKey = GlobalKey<FormState>();
  User? _user;

  Future<void> autoVerifyPhoneFn(PhoneAuthCredential credential) async {
    var success = await CustomAuth.updatePhoneNumber(credential, context);

    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      await showSnackBar(context, 'Failed to update email address');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Colors.white,
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: Center(
            child: Column(children: [
          // Start Common widgets

          const SizedBox(
            height: 42,
          ),

          Visibility(
            visible: _verifyCode,
            child: const Text(
              'Verify your phone number!',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                  color: Colors.black),
            ),
          ),
          Visibility(
            visible: !_verifyCode,
            child: const Text(
              'Change mobile number',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                  color: Colors.black),
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
                style: TextStyle(
                    fontSize: 14, color: Colors.black.withOpacity(0.6)),
              ),
            ),
          Visibility(
              visible: !_verifyCode,
              child: Text(
                'We’ll send you a verification code',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 14, color: Colors.black.withOpacity(0.6)),
              )),

          const SizedBox(
            height: 32,
          ),

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
            height: 24,
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
                style: TextStyle(
                    fontSize: 12,
                    color: _isResending
                        ? Colors.black.withOpacity(0.5)
                        : Config.appColorBlue),
              ),
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
                        style:
                            TextStyle(fontSize: 12, color: Color(0xffD1D3D9)),
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
                        ? Config.appColorBlue
                        : Colors.black.withOpacity(0.5)),
              ),
            ),
          ),
          const Spacer(),
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
            height: 20,
          ),
          cancelOption(context),
          const SizedBox(
            height: 36,
          ),
        ])),
      ),
    );
  }

  void clearPhoneCallBack() {
    setState(() {
      _phoneNumber = '';
      _phoneInputController.text = '';
      _nextBtnColor = Config.appColorDisabled;
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
      _nextBtnColor = Config.appColorDisabled;
      _user = CustomAuth.getUser();
    });
  }

  @override
  void initState() {
    super.initState();
    initialize();
  }

  Widget phoneInputField() {
    return Container(
        height: 48,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10.0)),
            border: Border.all(color: Config.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: _phoneInputController,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: Config.appColorBlue,
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
        _nextBtnColor = Config.appColorDisabled;
      });
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
    }

    setState(() {
      _phoneNumber = text;
    });
  }

  Future<void> requestVerification() async {
    var connected = await hasNetworkConnection();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }
    _phoneFormKey.currentState!.validate();
    if (!_phoneFormValid || _isVerifying) {
      return;
    }

    if (_user!.phoneNumber!.trim().toLowerCase() ==
        '$_countryCode$_phoneNumber'.trim().toLowerCase()) {
      await showSnackBar(context, 'Enter a different phone number');
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
      _codeSent = false;
    });

    await CustomAuth.requestPhoneVerification('$_countryCode$_phoneNumber',
        context, verifyPhoneFn, autoVerifyPhoneFn);

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _codeSent = true;
        _isVerifying = false;
      });
    });
  }

  Future<void> resendVerificationCode() async {
    var connected = await hasNetworkConnection();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    if (_isResending) {
      return;
    }

    setState(() {
      _isResending = true;
    });

    await CustomAuth.requestPhoneVerification('$_countryCode$_phoneNumber',
            context, verifyPhoneFn, autoVerifyPhoneFn)
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
        _nextBtnColor = Config.appColorBlue;
      });
    } else {
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
      });
    }
  }

  void verifyPhoneFn(verificationId) {
    setState(() {
      _verifyCode = true;
      _verificationId = verificationId;
    });

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _resendCode = true;
      });
    });
  }

  Future<void> verifySentCode() async {
    var connected = await hasNetworkConnection();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
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
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
    });

    var credential = PhoneAuthProvider.credential(
        verificationId: _verificationId,
        smsCode: _phoneVerificationCode.join(''));
    try {
      var success = await CustomAuth.updatePhoneNumber(credential, context);

      if (success) {
        Navigator.pop(context, true);
      } else {
        setState(() {
          _nextBtnColor = Config.appColorBlue;
          _isVerifying = false;
        });
        await showSnackBar(context, 'Failed to update phone number');
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      if (exception.code == 'invalid-verification-code') {
        await showSnackBar(context, 'Invalid Code');
        setState(() {
          _nextBtnColor = Config.appColorBlue;
          _isVerifying = false;
        });
      }
      if (exception.code == 'session-expired') {
        await CustomAuth.requestPhoneVerification('$_countryCode$_phoneNumber',
            context, verifyPhoneFn, autoVerifyPhoneFn);
        await showSnackBar(
            context,
            'Your verification '
            'has timed out. we have sent your'
            ' another verification code');
        setState(() {
          _nextBtnColor = Config.appColorBlue;
          _isVerifying = false;
        });
      }
    } catch (exception, stackTrace) {
      await showSnackBar(context, 'Try again later');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      debugPrint('$exception\n$stackTrace');
    }
  }
}
