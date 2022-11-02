import 'package:app/models/enum_constants.dart';
import 'package:app/services/services.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../themes/colors.dart';
import '../../widgets/custom_widgets.dart';
import 'auth_widgets.dart';

class ChangeEmailScreen extends StatefulWidget {
  const ChangeEmailScreen({super.key});

  @override
  ChangeEmailScreenState createState() => ChangeEmailScreenState();
}

class ChangeEmailScreenState extends State<ChangeEmailScreen> {
  bool _emailFormValid = false;
  String _emailAddress = '';
  bool _isVerifying = false;
  bool _isResending = false;
  int _emailToken = 1;
  bool _requestCode = false;
  bool _showResendCode = false;
  List<String> _emailVerificationCode = <String>['', '', '', '', '', ''];
  Color _nextBtnColor = CustomColors.appColorDisabled;

  final _emailFormKey = GlobalKey<FormState>();
  User? _user;
  final TextEditingController _emailInputController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomSafeArea(
        widget: Container(
          color: Colors.white,
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
            child: Column(children: [
              Visibility(
                visible: _requestCode,
                child: const Text(
                  'Verify your new email!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                    color: Colors.black,
                  ),
                ),
              ),
              Visibility(
                visible: !_requestCode,
                child: const Text(
                  'Change email',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                    color: Colors.black,
                  ),
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
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black.withOpacity(0.6),
                  ),
                ),
              ),
              Visibility(
                visible: !_requestCode,
                child: Text(
                  'We’ll send you a code to verify you new email address',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black.withOpacity(0.6),
                  ),
                ),
              ),

              const SizedBox(
                height: 32,
              ),

              Visibility(
                visible: _requestCode,
                child: Padding(
                  padding: const EdgeInsets.only(left: 36, right: 36),
                  child: OptField(
                    codeSent: _requestCode,
                    position: 0,
                    callbackFn: setCode,
                  ),
                ),
              ),
              Visibility(
                visible: !_requestCode,
                child: Form(
                  key: _emailFormKey,
                  child: _emailInputField(),
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
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.black.withOpacity(0.5),
                  ),
                ),
              ),
              Visibility(
                visible: _showResendCode && _requestCode,
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
                          : CustomColors.appColorBlue,
                    ),
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
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xffD1D3D9),
                          ),
                        ),
                      ),
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
                  onTap: _initialize,
                  child: Text(
                    'Change Email Address',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: _showResendCode
                          ? CustomColors.appColorBlue
                          : Colors.black.withOpacity(0.5),
                    ),
                  ),
                ),
              ),

              const Spacer(),
              Visibility(
                visible: _requestCode,
                child: GestureDetector(
                  onTap: () async {
                    await _verifySentCode();
                  },
                  child: NextButton(
                    buttonColor: _nextBtnColor,
                  ),
                ),
              ),
              Visibility(
                visible: !_requestCode,
                child: GestureDetector(
                  onTap: () async {
                    await _requestVerification();
                  },
                  child: NextButton(
                    buttonColor: _nextBtnColor,
                  ),
                ),
              ),
              const SizedBox(
                height: 20,
              ),
              const CancelOption(),
            ]),
          ),
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  void setCode(String value, int position) {
    setState(() => _emailVerificationCode[position] = value);
    final code = _emailVerificationCode.join('');
    if (code.length == 6) {
      setState(() => _nextBtnColor = CustomColors.appColorBlue);
    } else {
      setState(() => _nextBtnColor = CustomColors.appColorDisabled);
    }
  }

  void _clearEmailCallBack() {
    setState(
      () {
        _emailAddress = '';
        _emailInputController.text = '';
        _nextBtnColor = CustomColors.appColorDisabled;
      },
    );
  }

  Widget _emailInputField() {
    return Container(
      height: 48,
      alignment: Alignment.center,
      padding: const EdgeInsets.only(left: 15),
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
        border: Border.all(
          color: CustomColors.appColorBlue,
        ),
      ),
      child: Center(
        child: TextFormField(
          controller: _emailInputController,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.emailAddress,
          onChanged: _emailValueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(
                context,
                'Please enter your new email address',
              );
              setState(() => _emailFormValid = false);
            } else {
              if (!value.isValidEmail()) {
                showSnackBar(
                  context,
                  'Please enter a valid email address',
                );
                setState(() => _emailFormValid = false);
              } else {
                setState(() => _emailFormValid = true);
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
                _clearEmailCallBack();
              },
              child: const TextInputCloseButton(),
            ),
          ),
        ),
      ),
    );
  }

  void _emailValueChange(String text) {
    if (text.toString().isEmpty || !_emailInputController.text.isValidEmail()) {
      setState(() => _nextBtnColor = CustomColors.appColorDisabled);
    } else {
      setState(() => _nextBtnColor = CustomColors.appColorBlue);
    }
    setState(() => _emailAddress = text);
  }

  void _initialize() {
    setState(
      () {
        _emailFormValid = false;
        _emailAddress = '';
        _isVerifying = false;
        _isResending = false;
        _emailToken = 000000;
        _requestCode = false;
        _showResendCode = false;
        _emailVerificationCode = <String>['', '', '', '', '', ''];
        _nextBtnColor = CustomColors.appColorDisabled;
        _user = CustomAuth.getUser();
      },
    );
  }

  Future<void> _requestVerification() async {
    _emailFormKey.currentState!.validate();

    if (!_emailFormValid || _isVerifying) {
      return;
    }

    if (_user!.email!.trim().toLowerCase() ==
        _emailAddress.trim().toLowerCase()) {
      await showSnackBar(
        context,
        'Enter a different email address',
      );

      return;
    }

    setState(
      () {
        _nextBtnColor = CustomColors.appColorDisabled;
        _isVerifying = true;
      },
    );

    final emailVerificationResponse = await AirqoApiClient()
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailVerificationResponse == null) {
      await showSnackBar(
        context,
        'email verification failed',
      );
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
          _isVerifying = false;
        },
      );

      return;
    }

    setState(
      () {
        _emailToken = emailVerificationResponse.token;
        _requestCode = true;
        _isVerifying = false;
        _showResendCode = false;
      },
    );

    Future.delayed(
      const Duration(seconds: 5),
      () {
        setState(() => _showResendCode = true);
      },
    );
  }

  Future<void> _resendVerificationCode() async {
    setState(() => _isResending = true);

    final emailVerificationResponse = await AirqoApiClient()
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailVerificationResponse == null) {
      await showSnackBar(
        context,
        'Email verification failed',
      );

      return;
    }
    setState(
      () {
        _isResending = false;
        _emailToken = emailVerificationResponse.token;
      },
    );
  }

  Future<void> _verifySentCode() async {
    final code = _emailVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(
        context,
        'Enter all the 6 digits',
      );

      return;
    }

    if (_isVerifying) {
      return;
    }

    setState(
      () {
        _nextBtnColor = CustomColors.appColorDisabled;
        _isVerifying = true;
      },
    );

    if (code != _emailToken.toString()) {
      await showSnackBar(
        context,
        'Invalid Code',
      );
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
          _isVerifying = false;
        },
      );

      return;
    }
    final user = CustomAuth.getUser();

    if (user == null) {
      await showSnackBar(
        context,
        'Failed to update email address',
      );

      return;
    }

    final success = await CustomAuth.updateCredentials(
      context: context,
      emailAddress: _emailAddress,
      authMethod: AuthMethod.email,
    );

    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
          _isVerifying = false;
        },
      );
      await showSnackBar(
        context,
        'Failed to update email address',
      );
    }
  }
}
