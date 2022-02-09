import 'package:app/constants/config.dart';
import 'package:app/services/firebase_service.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class ChangeEmailScreen extends StatefulWidget {
  const ChangeEmailScreen({
    Key? key,
  }) : super(key: key);

  @override
  ChangeEmailScreenState createState() => ChangeEmailScreenState();
}

class ChangeEmailScreenState extends State<ChangeEmailScreen> {
  bool _emailFormValid = false;
  var _emailAddress = '';
  bool _isVerifying = false;
  bool _isResending = false;
  int _emailToken = 1;
  var _requestCode = false;
  var _showResendCode = false;
  var _emailVerificationCode = <String>['', '', '', '', '', ''];
  var _nextBtnColor = Config.appColorDisabled;

  final _emailFormKey = GlobalKey<FormState>();
  final CustomAuth _customAuth = CustomAuth();
  User? _user;
  final TextEditingController _emailInputController = TextEditingController();
  AirqoApiClient? _airqoApiClient;

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
          height: 20,
        ),

        Visibility(
          visible: _requestCode,
          child: const Text(
            'Verify your new email!',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),
        Visibility(
          visible: !_requestCode,
          child: const Text(
            'Change email',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontWeight: FontWeight.bold, fontSize: 24, color: Colors.black),
          ),
        ),

        const SizedBox(
          height: 8,
        ),

        Visibility(
          visible: _requestCode,
          child: Text(
            'Enter the 6 digit code sent to\n'
            '$_emailAddress',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
          ),
        ),
        Visibility(
            visible: !_requestCode,
            child: Text(
              'We’ll send you a code to verify you new email address',
              textAlign: TextAlign.center,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            )),

        const SizedBox(
          height: 32,
        ),

        Visibility(
          visible: _requestCode,
          child: Padding(
            padding: const EdgeInsets.only(left: 36, right: 36),
            child: optField(0, context, setCode, _requestCode),
          ),
        ),
        Visibility(
          visible: !_requestCode,
          child: Form(
            key: _emailFormKey,
            child: emailInputField(),
          ),
        ),
        // end input fields

        const SizedBox(
          height: 24,
        ),

        Visibility(
          visible: !_showResendCode && _requestCode,
          child: Text(
            'The code should arrive with in 10 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: _showResendCode && _requestCode,
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
          visible: _requestCode,
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
          visible: _requestCode,
          child: const SizedBox(
            height: 19,
          ),
        ),
        Visibility(
          visible: _requestCode,
          child: GestureDetector(
            onTap: initialize,
            child: Text(
              'Change Email Address',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: _showResendCode
                      ? Config.appColorBlue
                      : Colors.black.withOpacity(0.5)),
            ),
          ),
        ),

        const Spacer(),
        Visibility(
          visible: _requestCode,
          child: GestureDetector(
            onTap: () async {
              await verifySentCode();
            },
            child: nextButton('Next', _nextBtnColor),
          ),
        ),
        Visibility(
          visible: !_requestCode,
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
          height: 20,
        ),
      ])),
    ));
  }

  void clearEmailCallBack() {
    setState(() {
      _emailAddress = '';
      _emailInputController.text = '';
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  Widget emailInputField() {
    return Container(
        height: 48,
        alignment: Alignment.center,
        padding: const EdgeInsets.only(left: 15),
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            border: Border.all(color: Config.appColorBlue)),
        child: Center(
            child: TextFormField(
          controller: _emailInputController,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: Config.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: emailValueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your new email address');
              setState(() {
                _emailFormValid = false;
              });
            } else {
              if (!value.isValidEmail()) {
                showSnackBar(context, 'Please enter a valid email address');
                setState(() {
                  _emailFormValid = false;
                });
              } else {
                setState(() {
                  _emailFormValid = true;
                });
              }
            }
            return null;
          },
          decoration: InputDecoration(
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            hintText: 'Enter your new email',
            suffixIcon: GestureDetector(
                onTap: () {
                  _emailInputController.text = '';
                  clearEmailCallBack();
                },
                child: textInputCloseButton()),
          ),
        )));
  }

  void emailValueChange(text) {
    if (text.toString().isEmpty || !_emailInputController.text.isValidEmail()) {
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
      });
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
    }
    setState(() {
      _emailAddress = text;
    });
  }

  void initialize() {
    setState(() {
      _emailFormValid = false;
      _emailAddress = '';
      _isVerifying = false;
      _isResending = false;
      _emailToken = 000000;
      _requestCode = false;
      _showResendCode = false;
      _emailVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = Config.appColorDisabled;
      _user = _customAuth.getUser();
    });
  }

  @override
  void initState() {
    super.initState();
    _airqoApiClient = AirqoApiClient(context);
    initialize();
  }

  Future<void> requestVerification() async {
    _emailFormKey.currentState!.validate();

    if (!_emailFormValid || _isVerifying) {
      return;
    }

    if (_user!.email!.trim().toLowerCase() ==
        _emailAddress.trim().toLowerCase()) {
      await showSnackBar(context, 'Enter a different email address');
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
    });

    var emailVerificationResponse = await _airqoApiClient!
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailVerificationResponse == null) {
      await showSnackBar(context, 'email verification failed');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      return;
    }

    setState(() {
      _emailToken = emailVerificationResponse.token;
      _requestCode = true;
      _isVerifying = false;
      _showResendCode = false;
    });

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _showResendCode = true;
      });
    });
  }

  Future<void> resendVerificationCode() async {
    setState(() {
      _isResending = true;
    });

    var emailVerificationResponse = await _airqoApiClient!
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailVerificationResponse == null) {
      await showSnackBar(context, 'Email verification failed');
      return;
    }
    setState(() {
      _isResending = false;
      _emailToken = emailVerificationResponse.token;
    });
  }

  void setCode(value, position) {
    setState(() {
      _emailVerificationCode[position] = value;
    });
    var code = _emailVerificationCode.join('');
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

  Future<void> verifySentCode() async {
    var code = _emailVerificationCode.join('');

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

    if (code != _emailToken.toString()) {
      await showSnackBar(context, 'Invalid Code');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      return;
    }
    var user = _customAuth.getUser();

    if (user == null) {
      await showSnackBar(context, 'Failed to update email address');
      return;
    }

    var success = await _customAuth.updateEmailAddress(_emailAddress, context);

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
}
