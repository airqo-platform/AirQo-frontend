import 'dart:async';

import 'package:app/constants/config.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../models/enum_constants.dart';
import '../../services/firebase_service.dart';
import '../../themes/light_theme.dart';
import '../../utils/network.dart';
import '../../widgets/custom_shimmer.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'auth_widgets.dart';
import 'email_auth_widget.dart';

class PhoneAuthWidget extends StatefulWidget {
  final String? phoneNumber;
  final AuthProcedure authProcedure;

  const PhoneAuthWidget({
    Key? key,
    this.phoneNumber,
    required this.authProcedure,
  }) : super(key: key);

  @override
  PhoneAuthWidgetState createState() => PhoneAuthWidgetState();
}

class PhoneAuthWidgetState<T extends PhoneAuthWidget> extends State<T> {
  late String _phoneNumber;
  late String _countryCode;
  bool _verifyCode = false;
  bool _showAuthOptions = true;
  String _verificationId = '';
  bool _codeSent = false;
  List<String> _phoneVerificationCode = <String>['', '', '', '', '', ''];
  late Color _nextBtnColor;
  DateTime? _exitTime;
  late BuildContext _loadingContext;
  String _authOptionsText = '';
  String _authOptionsButtonText = '';

  late TextEditingController _phoneInputController;
  final _phoneFormKey = GlobalKey<FormState>();
  final AppService _appService = AppService();
  int _codeSentCountDown = 0;

  void autoVerifyPhoneFn(PhoneAuthCredential credential) {
    _authenticatePhoneNumber(credential);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: Container(
              color: Colors.white,
              child: Center(child: Column(children: _getColumnWidget())),
            )));
  }

  void clearPhoneCallBack() {
    if (_phoneNumber == '') {
      FocusScope.of(context).unfocus();
      Future.delayed(const Duration(milliseconds: 400), () {
        setState(() {
          _showAuthOptions = true;
        });
      });
    }
    setState(() {
      _phoneNumber = '';
      _phoneInputController.text = '';
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  void codeValueChange(text) {
    setState(() {
      _countryCode = text;
    });
  }

  @override
  void dispose() {
    _phoneInputController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadingContext = context;
    _initialize();
  }

  Future<bool> onWillPop() {
    var now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(context, 'Tap again to cancel !');
      return Future.value(false);
    }

    Navigator.pop(_loadingContext);

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return const HomePage();
    }), (r) => false);

    return Future.value(false);
  }

  Widget phoneInputField() {
    return TextFormField(
      controller: _phoneInputController,
      onEditingComplete: () async {
        FocusScope.of(context).requestFocus(FocusNode());
        Future.delayed(const Duration(milliseconds: 400), () {
          setState(() {
            _showAuthOptions = true;
          });
        });
      },
      onTap: () {
        setState(() {
          _showAuthOptions = false;
        });
      },
      onChanged: phoneValueChange,
      style: Theme.of(context).textTheme.bodyText1,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your phone number';
        }
        return null;
      },
      enableSuggestions: false,
      cursorWidth: 1,
      autofocus: false,
      cursorColor: Config.appColorBlue,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        border: OutlineInputBorder(
            borderSide: BorderSide(color: Config.appColorBlue, width: 1.0),
            borderRadius: BorderRadius.circular(8.0)),
        hintText: '0700000000',
        prefixIcon: Padding(
            padding: const EdgeInsets.fromLTRB(8, 11, 0, 15),
            child: Text(
              '$_countryCode ',
              style: Theme.of(context)
                  .textTheme
                  .bodyText1
                  ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
            )),
        hintStyle: Theme.of(context)
            .textTheme
            .bodyText1
            ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
        prefixStyle: Theme.of(context)
            .textTheme
            .bodyText1
            ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
        suffixIcon: GestureDetector(
          onTap: clearPhoneCallBack,
          child: const TextInputCloseButton(),
        ),
        errorStyle: const TextStyle(
          fontSize: 0,
        ),
      ),
    );
  }

  List<Widget> phoneInputWidget() {
    return [
      const SizedBox(
        height: 56,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 40, right: 40),
        child: AutoSizeText(
          _authOptionsText,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline7(context),
        ),
      ),
      const SizedBox(
        height: 8,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 40, right: 40),
        child: AutoSizeText('We\'ll send you a verification code',
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context)
                .textTheme
                .bodyText2
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
      ),
      const SizedBox(
        height: 32,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
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
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () {
            setState(() {
              Navigator.pushAndRemoveUntil(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) {
                      if (widget.authProcedure == AuthProcedure.login) {
                        return const EmailLoginWidget();
                      }
                      return const EmailSignUpWidget();
                    },
                    transitionsBuilder:
                        (context, animation, secondaryAnimation, child) {
                      return FadeTransition(
                        opacity:
                            animation.drive(Tween<double>(begin: 0, end: 1)),
                        child: child,
                      );
                    },
                  ),
                  (r) => false);
            });
          },
          child: SignUpButton(text: _authOptionsButtonText),
        ),
      ),
      const Spacer(),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () async {
            await _requestVerification();
          },
          child: nextButton('Next', _nextBtnColor),
        ),
      ),
      Visibility(
        visible: _showAuthOptions,
        child: const Padding(
          padding: EdgeInsets.only(left: 24, right: 24),
          child: SizedBox(
            height: 16,
          ),
        ),
      ),
      Visibility(
        visible: _showAuthOptions,
        child: Padding(
          padding: const EdgeInsets.only(left: 24, right: 24),
          child: widget.authProcedure == AuthProcedure.login
              ? const LoginOptions()
              : const SignUpOptions(),
        ),
      ),
      SizedBox(
        height: _showAuthOptions ? 40 : 12,
      ),
    ];
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

  List<Widget> phoneVerificationWidget() {
    return [
      const SizedBox(
        height: 56,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: AutoSizeText(
          'Verify your account',
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: CustomTextStyle.headline7(context),
        ),
      ),
      const SizedBox(
        height: 8,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 40, right: 40),
        child: AutoSizeText(
            // 'Enter the 6 digits code sent to your\n'
            //     'number that ends with ...'
            //     '${phoneNumber.substring(phoneNumber.length - 3)}',
            'Enter the 6 digits code sent to your '
            'number $_countryCode$_phoneNumber',
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context)
                .textTheme
                .bodyText2
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
      ),
      const SizedBox(
        height: 32,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 60, right: 60),
        child: optFieldV2(0, context, setCode, _codeSent),
      ),
      const SizedBox(
        height: 16,
      ),
      Visibility(
        visible: _codeSentCountDown > 0,
        child: Text('The code should arrive with in $_codeSentCountDown sec',
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .caption
                ?.copyWith(color: Config.appColorBlack.withOpacity(0.5))),
      ),
      Visibility(
        visible: _codeSentCountDown <= 0,
        child: GestureDetector(
          onTap: () async {
            await _resendVerificationCode();
          },
          child: Text('Resend code',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .caption
                  ?.copyWith(color: Config.appColorBlue)),
        ),
      ),
      const SizedBox(
        height: 19,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 60, right: 60),
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
                child: Text('Or',
                    style: Theme.of(context)
                        .textTheme
                        .caption
                        ?.copyWith(color: const Color(0xffD1D3D9)))),
          ],
        ),
      ),
      const SizedBox(
        height: 19,
      ),
      GestureDetector(
        onTap: _initialize,
        child: Text(
          'Change Phone Number',
          textAlign: TextAlign.center,
          style: Theme.of(context)
              .textTheme
              .caption
              ?.copyWith(color: Config.appColorBlue),
        ),
      ),
      const Spacer(),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () async {
            await _verifySentCode();
          },
          child: nextButton('Next', _nextBtnColor),
        ),
      ),
      const SizedBox(
        height: 12,
      ),
    ];
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
  }

  Future<void> _authenticatePhoneNumber(AuthCredential authCredential) async {
    if (widget.authProcedure == AuthProcedure.login) {
      var loginSuccessful = await _appService.authenticateUser(
          authProcedure: AuthProcedure.login,
          buildContext: context,
          authMethod: AuthMethod.phone,
          authCredential: authCredential);
      if (loginSuccessful) {
        Navigator.pop(_loadingContext);
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const HomePage();
        }), (r) => false);
      } else {
        Navigator.pop(_loadingContext);
        setState(() {
          _codeSent = true;
          _nextBtnColor = Config.appColorBlue;
        });
        await showSnackBar(context, 'Login failed.');
      }
    } else {
      var signUpSuccessful = await _appService.authenticateUser(
          authProcedure: AuthProcedure.signup,
          buildContext: context,
          authMethod: AuthMethod.phone,
          authCredential: authCredential);
      if (signUpSuccessful) {
        Navigator.pop(_loadingContext);
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const ProfileSetupScreen();
        }), (r) => false);
      } else {
        Navigator.pop(_loadingContext);
        setState(() {
          _codeSent = true;
          _nextBtnColor = Config.appColorBlue;
        });
        await showSnackBar(context, 'Signup failed.');
      }
    }
  }

  List<Widget> _getColumnWidget() {
    if (_verifyCode) {
      return phoneVerificationWidget();
    }

    return phoneInputWidget();
  }

  void _initialize() {
    setState(() {
      _phoneNumber = (widget.phoneNumber == null
          ? ''
          : widget.phoneNumber?.split('.').last)!;
      _countryCode = (widget.phoneNumber == null
          ? '+256'
          : widget.phoneNumber?.split('.').first)!;
      _phoneVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = widget.phoneNumber == null
          ? Config.appColorDisabled
          : Config.appColorBlue;
      _verifyCode = false;
      _verificationId = '';
      _codeSent = false;
      _phoneInputController = TextEditingController(text: _phoneNumber);
      _showAuthOptions = true;
      _authOptionsText = widget.authProcedure == AuthProcedure.login
          ? 'Login with your mobile number or email'
          : 'Sign up with your mobile number or email';
      _authOptionsButtonText = widget.authProcedure == AuthProcedure.login
          ? 'Login with an email instead'
          : 'Sign up with an email instead';
    });
  }

  Future<void> _requestVerification() async {
    var connected = await checkNetworkConnection(context);
    if (!connected) {
      return;
    }

    if (_phoneFormKey.currentState!.validate()) {
      FocusScope.of(context).requestFocus(FocusNode());
      setState(() {
        _nextBtnColor = Config.appColorDisabled;
        _codeSent = false;
        _showAuthOptions = true;
      });
      loadingScreen(_loadingContext);

      var connected = await checkNetworkConnection(context);
      if (!connected) {
        Navigator.pop(_loadingContext);
        setState(() {
          _codeSent = true;
        });
        return;
      }

      var phoneNumber = '$_countryCode$_phoneNumber';

      if (widget.authProcedure == AuthProcedure.signup) {
        var phoneNumberTaken = await _appService.doesUserExist(
            phoneNumber: phoneNumber, buildContext: context);

        if (phoneNumberTaken) {
          setState(() {
            _codeSent = true;
          });
          Navigator.pop(_loadingContext);
          await showSnackBar(
              context,
              'You already have an '
              'account with this phone number');
          await Navigator.pushAndRemoveUntil(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    PhoneLoginWidget(
                  phoneNumber: '$_countryCode.$_phoneNumber',
                ),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation.drive(Tween<double>(begin: 0, end: 1)),
                    child: child,
                  );
                },
              ),
              (r) => false);
          return;
        }
      }

      var success = await CustomAuth.requestPhoneVerification(
          phoneNumber, context, verifyPhoneFn, autoVerifyPhoneFn);

      Navigator.pop(_loadingContext);

      if (success) {
        setState(() {
          _codeSent = true;
        });
      } else {
        setState(() {
          _codeSent = false;
        });
      }
    }

    _startCodeSentCountDown();
  }

  Future<void> _resendVerificationCode() async {
    var connected = await checkNetworkConnection(context);
    if (!connected) {
      return;
    }

    loadingScreen(_loadingContext);

    var success = await CustomAuth.requestPhoneVerification(
        '$_countryCode$_phoneNumber',
        context,
        verifyPhoneFn,
        autoVerifyPhoneFn);

    Navigator.pop(_loadingContext);

    if (success) {
      setState(() {
        _codeSent = true;
      });
    } else {
      setState(() {
        _codeSent = false;
      });
    }

    _startCodeSentCountDown();
  }

  void _startCodeSentCountDown() {
    setState(() {
      _codeSentCountDown = 5;
    });
    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (_codeSentCountDown == 0) {
          setState(() {
            timer.cancel();
            _codeSent = true;
          });
        } else {
          setState(() {
            _codeSentCountDown--;
          });
        }
      },
    );
  }

  Future<void> _verifySentCode() async {
    var connected = await checkNetworkConnection(context);
    if (!connected) {
      return;
    }

    var code = _phoneVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(context, 'Enter all the 6 digits');
      return;
    }

    FocusScope.of(context).requestFocus(FocusNode());
    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _showAuthOptions = true;
    });

    loadingScreen(_loadingContext);

    var phoneCredential = PhoneAuthProvider.credential(
        verificationId: _verificationId,
        smsCode: _phoneVerificationCode.join(''));

    await _authenticatePhoneNumber(phoneCredential);
  }
}

class PhoneLoginWidget extends PhoneAuthWidget {
  const PhoneLoginWidget({Key? key, String? phoneNumber})
      : super(
            key: key,
            phoneNumber: phoneNumber,
            authProcedure: AuthProcedure.login);

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends PhoneAuthWidgetState<PhoneLoginWidget> {}

class PhoneSignUpWidget extends PhoneAuthWidget {
  const PhoneSignUpWidget({Key? key})
      : super(key: key, authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends PhoneAuthWidgetState<PhoneSignUpWidget> {}
