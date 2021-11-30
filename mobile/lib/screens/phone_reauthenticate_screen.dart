import 'package:app/constants/app_constants.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PhoneReAuthenticateScreen extends StatefulWidget {
  UserDetails userDetails;

  PhoneReAuthenticateScreen(this.userDetails, {Key? key}) : super(key: key);

  @override
  PhoneReAuthenticateScreenState createState() =>
      PhoneReAuthenticateScreenState();
}

class PhoneReAuthenticateScreenState extends State<PhoneReAuthenticateScreen> {
  String _verificationId = '';
  bool _codeSent = false;
  bool _isResending = false;
  bool _isVerifying = false;

  // bool _resendCode = false;
  List<String> _phoneVerificationCode = <String>['', '', '', '', '', ''];
  Color _nextBtnColor = ColorConstants.appColorDisabled;

  final CustomAuth _customAuth = CustomAuth();

  Future<void> autoVerifyPhoneFn(PhoneAuthCredential credential) async {
    var success =
        await _customAuth.reAuthenticateWithPhoneNumber(credential, context);
    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() {
        _nextBtnColor = ColorConstants.appColorBlue;
        _isVerifying = false;
      });
      await showSnackBar(
          context,
          'Failed to verify phone number.'
          ' Try again later');
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
        const SizedBox(
          height: 42,
        ),
        const Text(
          'Verify your action!',
          textAlign: TextAlign.center,
          style: TextStyle(
              fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
        ),
        const SizedBox(
          height: 8,
        ),
        if (widget.userDetails.phoneNumber.length > 8)
          Text(
            'Enter the 6 digits code sent to your\n'
            'number ${widget.userDetails.phoneNumber}',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
          ),
        const SizedBox(
          height: 32,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 36, right: 36),
          child: optField(0, context, setCode, _codeSent),
        ),
        const SizedBox(
          height: 24,
        ),
        Visibility(
          visible: !_codeSent,
          child: Text(
            'The code should arrive with in 5 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: _codeSent,
          child: GestureDetector(
            onTap: () async {
              await _resendVerificationCode();
            },
            child: Text(
              'Resend code',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: _isResending
                      ? Colors.black.withOpacity(0.5)
                      : ColorConstants.appColorBlue),
            ),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () async {
            await _verifySentCode();
          },
          child: nextButton('Verify', _nextBtnColor),
        ),
        const SizedBox(
          height: 20,
        ),
        cancelOption(context),
        const SizedBox(
          height: 36,
        ),
      ])),
    ));
  }

  @override
  void initState() {
    _initialize();
    _requestVerification();
    super.initState();
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
      _verificationId = verificationId;
    });

    // Future.delayed(const Duration(seconds: 5), () async {
    //   setState(() {
    //     _resendCode = true;
    //   });
    // });
  }

  void _initialize() {
    setState(() {
      _verificationId = '';
      // _resendCode = false;
      _codeSent = false;
      _isResending = false;
      _isVerifying = false;
      _phoneVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = ColorConstants.appColorDisabled;
    });
  }

  Future<void> _requestVerification() async {
    var connected = await _customAuth.isConnected();
    if (!connected) {
      await showSnackBar(context, ErrorMessages.timeoutException);
      return;
    }
    setState(() {
      _nextBtnColor = ColorConstants.appColorDisabled;
      _isVerifying = true;
      _codeSent = false;
    });

    await _customAuth.verifyPhone(widget.userDetails.phoneNumber, context,
        verifyPhoneFn, autoVerifyPhoneFn);

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _codeSent = true;
        _isVerifying = false;
      });
    });
  }

  Future<void> _resendVerificationCode() async {
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
        .verifyPhone(widget.userDetails.phoneNumber, context, verifyPhoneFn,
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

  Future<void> _verifySentCode() async {
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
      var success =
          await _customAuth.reAuthenticateWithPhoneNumber(credential, context);
      if (success) {
        Navigator.pop(context, true);
      } else {
        setState(() {
          _nextBtnColor = ColorConstants.appColorBlue;
          _isVerifying = false;
        });
        await showSnackBar(
            context,
            'Failed to verify phone number.'
            ' Try again later');
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
        await _customAuth.verifyPhone(widget.userDetails.phoneNumber, context,
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
