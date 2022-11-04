import 'package:app/models/models.dart';
import 'package:app/services/services.dart';
import 'package:app/themes/theme.dart';
import 'package:app/utils/utils.dart';
import 'package:app/widgets/widgets.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'auth_widgets.dart';

class ChangePhoneScreen extends StatefulWidget {
  const ChangePhoneScreen({
    super.key,
  });

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
  Color _nextBtnColor = CustomColors.appColorDisabled;

  final TextEditingController _phoneInputController = TextEditingController();
  final _phoneFormKey = GlobalKey<FormState>();
  User? _user;

  Future<void> autoVerifyPhoneFn(PhoneAuthCredential credential) async {
    final success = await CustomAuth.updateCredentials(
      context: context,
      phoneCredential: credential,
      authMethod: AuthMethod.phone,
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
      showSnackBar(context, 'Failed to update email address');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppSafeArea(
        widget: Container(
          color: Colors.white,
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: Center(
            child: Column(children: [
              Visibility(
                visible: _verifyCode,
                child: const Text(
                  'Verify your phone number!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                    color: Colors.black,
                  ),
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
                    color: Colors.black,
                  ),
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
                    'Enter the 6 digits code sent to your number'
                    '\n$_countryCode$_phoneNumber',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.black.withOpacity(0.6),
                    ),
                  ),
                ),
              Visibility(
                visible: !_verifyCode,
                child: Text(
                  'We’ll send you a verification code',
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
                visible: _verifyCode,
                child: Padding(
                  padding: const EdgeInsets.only(left: 36, right: 36),
                  child: OptField(
                    callbackFn: setCode,
                  ),
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
                          child: CountryCodePickerField(
                            valueChange: codeValueChange,
                            placeholder: _countryCode,
                          ),
                        ),
                        const SizedBox(
                          width: 16,
                        ),
                        Expanded(
                          child: phoneInputField(),
                        ),
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
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.black.withOpacity(0.5),
                  ),
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
                          : CustomColors.appColorBlue,
                    ),
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
                          ? CustomColors.appColorBlue
                          : Colors.black.withOpacity(0.5),
                    ),
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
                  child: NextButton(buttonColor: _nextBtnColor),
                ),
              ),
              Visibility(
                visible: !_verifyCode,
                child: GestureDetector(
                  onTap: () async {
                    await requestVerification();
                  },
                  child: NextButton(buttonColor: _nextBtnColor),
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

  void clearPhoneCallBack() {
    setState(
      () {
        _phoneNumber = '';
        _phoneInputController.text = '';
        _nextBtnColor = CustomColors.appColorDisabled;
      },
    );
  }

  void codeValueChange(String? countryCode) {
    setState(
      () {
        _countryCode = countryCode ?? '';
        _countryCodePlaceHolder = '$countryCode(0) ';
      },
    );
  }

  void initialize() {
    setState(
      () {
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
        _nextBtnColor = CustomColors.appColorDisabled;
        _user = CustomAuth.getUser();
      },
    );
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
        borderRadius: const BorderRadius.all(
          Radius.circular(10.0),
        ),
        border: Border.all(
          color: CustomColors.appColorBlue,
        ),
      ),
      child: Center(
        child: TextFormField(
          controller: _phoneInputController,
          autofocus: true,
          enableSuggestions: false,
          cursorWidth: 1,
          cursorColor: CustomColors.appColorBlue,
          keyboardType: TextInputType.number,
          onChanged: phoneValueChange,
          validator: (value) {
            if (value == null || value.isEmpty) {
              showSnackBar(context, 'Please enter your phone number');
              setState(() => _phoneFormValid = false);
            } else {
              setState(() => _phoneFormValid = true);
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
              child: const TextInputCloseButton(),
            ),
          ),
        ),
      ),
    );
  }

  void phoneValueChange(String text) {
    if (text.toString().isEmpty) {
      setState(() => _nextBtnColor = CustomColors.appColorDisabled);
    } else {
      setState(() => _nextBtnColor = CustomColors.appColorBlue);
    }

    setState(() => _phoneNumber = text);
  }

  Future<void> requestVerification() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }
    _phoneFormKey.currentState!.validate();
    if (!_phoneFormValid || _isVerifying) {
      return;
    }

    if (_user!.phoneNumber!.trim().toLowerCase() ==
        '$_countryCode$_phoneNumber'.trim().toLowerCase()) {
      showSnackBar(
        context,
        'Enter a different phone number',
      );

      return;
    }

    setState(
      () {
        _nextBtnColor = CustomColors.appColorDisabled;
        _isVerifying = true;
        _codeSent = false;
      },
    );

    // await CustomAuth.requestPhoneAuthCode(
    //   '$_countryCode$_phoneNumber',
    //   context,
    //   verifyPhoneFn,
    //   autoVerifyPhoneFn,
    // );

    Future.delayed(
      const Duration(seconds: 5),
      () {
        setState(
          () {
            _codeSent = true;
            _isVerifying = false;
          },
        );
      },
    );
  }

  Future<void> resendVerificationCode() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }

    if (_isResending) {
      return;
    }

    setState(
      () => _isResending = true,
    );

    // await CustomAuth.requestPhoneAuthCode(
    //   '$_countryCode$_phoneNumber',
    //   context,
    //   verifyPhoneFn,
    //   autoVerifyPhoneFn,
    // )
    //     .then(
    //       (value) => {
    //         setState(() => _isResending = false),
    //       },
    //     )
    //     .whenComplete(
    //       () => {
    //         setState(
    //           () => _isResending = false,
    //         ),
    //       },
    //     );
  }

  void setCode(String value) {
    setState(() => _phoneVerificationCode[0] = value);
    final code = _phoneVerificationCode.join('');
    if (code.length == 6) {
      setState(() => _nextBtnColor = CustomColors.appColorBlue);
    } else {
      setState(() => _nextBtnColor = CustomColors.appColorDisabled);
    }
  }

  void verifyPhoneFn(String verificationId) {
    setState(
      () {
        _verifyCode = true;
        _verificationId = verificationId;
      },
    );

    Future.delayed(
      const Duration(seconds: 5),
      () {
        setState(() => _resendCode = true);
      },
    );
  }

  Future<void> verifySentCode() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }

    final code = _phoneVerificationCode.join('');

    if (code.length != 6) {
      showSnackBar(context, 'Enter all the 6 digits');

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

    final credential = PhoneAuthProvider.credential(
      verificationId: _verificationId,
      smsCode: _phoneVerificationCode.join(''),
    );
    try {
      final success = await CustomAuth.updateCredentials(
        context: context,
        phoneCredential: credential,
        authMethod: AuthMethod.phone,
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
        showSnackBar(context, 'Failed to update phone number');
      }
    } on FirebaseAuthException catch (exception, stackTrace) {
      debugPrint('$exception\n$stackTrace');
      if (exception.code == 'invalid-verification-code') {
        showSnackBar(context, 'Invalid Code');
        setState(
          () {
            _nextBtnColor = CustomColors.appColorBlue;
            _isVerifying = false;
          },
        );
      }
      if (exception.code == 'session-expired') {
        // await CustomAuth.requestPhoneAuthCode(
        //   '$_countryCode$_phoneNumber',
        //   context,
        //   verifyPhoneFn,
        //   autoVerifyPhoneFn,
        // );
        await showSnackBar(
          context,
          'Your verification '
          'has timed out. we have sent your'
          ' another verification code',
        );
        setState(
          () {
            _nextBtnColor = CustomColors.appColorBlue;
            _isVerifying = false;
          },
        );
      }
    } catch (exception, stackTrace) {
      showSnackBar(
        context,
        'Try again later',
      );
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
          _isVerifying = false;
        },
      );
      debugPrint('$exception\n$stackTrace');
    }
  }
}
