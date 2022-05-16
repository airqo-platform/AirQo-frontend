import 'package:app/constants/config.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../utils/network.dart';
import 'auth_widgets.dart';

class PhoneReAuthenticateScreen extends StatefulWidget {
  final UserDetails userDetails;

  const PhoneReAuthenticateScreen(this.userDetails, {Key? key})
      : super(key: key);

  @override
  PhoneReAuthenticateScreenState createState() =>
      PhoneReAuthenticateScreenState();
}

class PhoneReAuthenticateScreenState extends State<PhoneReAuthenticateScreen> {
  String _verificationId = '';
  bool _codeSent = false;
  bool _isResending = false;
  bool _isVerifying = false;

  List<String> _phoneVerificationCode = <String>['', '', '', '', '', ''];
  Color _nextBtnColor = Config.appColorDisabled;

  Future<void> autoVerifyPhoneFn(PhoneAuthCredential credential) async {
    var success =
        await CustomAuth.reAuthenticateWithPhoneNumber(credential, context);
    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
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
                      : Config.appColorBlue),
            ),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: () async {
            await _verifySentCode();
          },
          child: NextButton(text: 'Verify', buttonColor: _nextBtnColor),
        ),
        const SizedBox(
          height: 20,
        ),
        const CancelOption(),
        const SizedBox(
          height: 36,
        ),
      ])),
    ));
  }

  @override
  void initState() {
    super.initState();
    _initialize();
    _requestVerification();
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
      _verificationId = verificationId;
    });

    // Future.delayed(const Duration(seconds: 5), () {
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
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  Future<void> _requestVerification() async {
    var connected = await hasNetworkConnection();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }
    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
      _codeSent = false;
    });

    await CustomAuth.requestPhoneVerification(widget.userDetails.phoneNumber,
        context, verifyPhoneFn, autoVerifyPhoneFn);

    if (!mounted) {
      return;
    }

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _codeSent = true;
        _isVerifying = false;
      });
    });
  }

  Future<void> _resendVerificationCode() async {
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

    await CustomAuth.requestPhoneVerification(widget.userDetails.phoneNumber,
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

  Future<void> _verifySentCode() async {
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
      var success =
          await CustomAuth.reAuthenticateWithPhoneNumber(credential, context);
      if (success) {
        Navigator.pop(context, true);
      } else {
        setState(() {
          _nextBtnColor = Config.appColorBlue;
          _isVerifying = false;
        });
        await showSnackBar(
            context,
            'Failed to verify phone number.'
            ' Try again later');
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
        await CustomAuth.requestPhoneVerification(
            widget.userDetails.phoneNumber,
            context,
            verifyPhoneFn,
            autoVerifyPhoneFn);
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
