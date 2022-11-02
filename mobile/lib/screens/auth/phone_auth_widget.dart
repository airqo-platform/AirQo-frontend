import 'dart:async';

import 'package:app/models/models.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/themes/theme.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/dialogs.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../services/firebase_service.dart';
import '../../utils/network.dart';
import '../../widgets/custom_shimmer.dart';
import '../../widgets/custom_widgets.dart';
import '../on_boarding/profile_setup_screen.dart';
import 'auth_widgets.dart';
import 'email_auth_widget.dart';

class PhoneAuthWidget extends StatefulWidget {
  const PhoneAuthWidget({
    super.key,
    this.phoneNumber,
    required this.authProcedure,
  });
  final String? phoneNumber;
  final AuthProcedure authProcedure;

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
        child: CustomSafeArea(
          widget: Container(
            color: Colors.white,
            child: Center(
              child: Column(
                children: _getColumnWidget(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void clearPhoneCallBack() {
    if (_phoneNumber == '') {
      FocusScope.of(context).unfocus();
      Future.delayed(
        const Duration(milliseconds: 400),
        () {
          setState(
            () {
              _showAuthOptions = true;
            },
          );
        },
      );
    }
    setState(
      () {
        _phoneNumber = '';
        _phoneInputController.text = '';
        _nextBtnColor = CustomColors.appColorDisabled;
      },
    );
  }

  void codeValueChange(String? countryCode) {
    setState(() => _countryCode = countryCode ?? '');
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
    final now = DateTime.now();

    if (_exitTime == null ||
        now.difference(_exitTime!) > const Duration(seconds: 2)) {
      _exitTime = now;

      showSnackBar(
        context,
        'Tap again to cancel !',
      );

      return Future.value(false);
    }

    Navigator.pop(_loadingContext);

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) {
          return const HomePage();
        },
      ),
      (r) => false,
    );

    return Future.value(false);
  }

  Widget phoneInputField() {
    return TextFormField(
      controller: _phoneInputController,
      inputFormatters: [
        FilteringTextInputFormatter.allow(
          RegExp(r'[0-9]'),
        ),
        PhoneNumberInputFormatter(),
      ],
      onEditingComplete: () async {
        FocusScope.of(context).requestFocus(
          FocusNode(),
        );
        Future.delayed(
          const Duration(milliseconds: 400),
          () {
            setState(
              () {
                _showAuthOptions = true;
              },
            );
          },
        );
      },
      onTap: () {
        setState(
          () {
            _showAuthOptions = false;
          },
        );
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
      cursorColor: CustomColors.appColorBlue,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.fromLTRB(16, 12, 0, 12),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: CustomColors.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: CustomColors.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        border: OutlineInputBorder(
          borderSide: BorderSide(color: CustomColors.appColorBlue, width: 1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        hintText: '700 000 000',
        prefixIcon: Padding(
          padding: const EdgeInsets.fromLTRB(8, 11, 0, 15),
          child: Text(
            '$_countryCode ',
            style: Theme.of(context).textTheme.bodyText1?.copyWith(
                  color: CustomColors.appColorBlack.withOpacity(0.32),
                ),
          ),
        ),
        hintStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.32),
            ),
        prefixStyle: Theme.of(context).textTheme.bodyText1?.copyWith(
              color: CustomColors.appColorBlack.withOpacity(0.32),
            ),
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

  List<Widget> _phoneInputWidget() {
    return [
      Padding(
        padding: const EdgeInsets.only(left: 40, right: 40),
        child: AutoSizeText(
          AuthMethod.phone.optionsText(widget.authProcedure),
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
        child: AutoSizeText(
          'We’ll send you a verification code',
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyText2?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.6),
              ),
        ),
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
        height: 32,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () {
            setState(
              () {
                Navigator.pushAndRemoveUntil(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) =>
                        widget.authProcedure == AuthProcedure.login
                            ? const EmailLoginWidget()
                            : const EmailSignUpWidget(),
                    transitionsBuilder: (
                      context,
                      animation,
                      secondaryAnimation,
                      child,
                    ) {
                      return FadeTransition(
                        opacity: animation.drive(
                          Tween<double>(
                            begin: 0,
                            end: 1,
                          ),
                        ),
                        child: child,
                      );
                    },
                  ),
                  (r) => false,
                );
              },
            );
          },
          child: SignUpButton(
            text: AuthMethod.phone.optionsButtonText(widget.authProcedure),
          ),
        ),
      ),
      const Spacer(),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () async {
            await _requestVerification();
          },
          child: NextButton(buttonColor: _nextBtnColor),
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
    ];
  }

  void phoneValueChange(text) {
    if (text.toString().isEmpty) {
      setState(
        () {
          _nextBtnColor = CustomColors.appColorDisabled;
        },
      );
    } else {
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
        },
      );
    }

    setState(
      () {
        _phoneNumber = text;
      },
    );
  }

  List<Widget> _phoneVerificationWidget() {
    return [
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
          'Enter the 6 digits code sent to your '
          'number\n$_countryCode $_phoneNumber',
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodyText2?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.6),
              ),
        ),
      ),
      const SizedBox(
        height: 32,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 60, right: 60),
        child: OptField(
          codeSent: _codeSent,
          position: 0,
          callbackFn: setCode,
        ),
      ),
      const SizedBox(
        height: 16,
      ),
      Visibility(
        visible: _codeSentCountDown > 0,
        child: Text(
          'The code should arrive with in $_codeSentCountDown sec',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.caption?.copyWith(
                color: CustomColors.appColorBlack.withOpacity(0.5),
              ),
        ),
      ),
      Visibility(
        visible: _codeSentCountDown <= 0,
        child: GestureDetector(
          onTap: () async {
            await _resendVerificationCode();
          },
          child: Text(
            'Resend code',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.caption?.copyWith(
                  color: CustomColors.appColorBlue,
                ),
          ),
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
              child: Text(
                'Or',
                style: Theme.of(context).textTheme.caption?.copyWith(
                      color: const Color(0xffD1D3D9),
                    ),
              ),
            ),
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
          style: Theme.of(context).textTheme.caption?.copyWith(
                color: CustomColors.appColorBlue,
              ),
        ),
      ),
      const Spacer(),
      Padding(
        padding: const EdgeInsets.only(left: 24, right: 24),
        child: GestureDetector(
          onTap: () async {
            await _verifySentCode();
          },
          child: NextButton(buttonColor: _nextBtnColor),
        ),
      ),
    ];
  }

  void setCode(String value, int position) {
    setState(
      () {
        _phoneVerificationCode[position] = value;
      },
    );
    final code = _phoneVerificationCode.join('');
    if (code.length == 6) {
      setState(
        () {
          _nextBtnColor = CustomColors.appColorBlue;
        },
      );
    } else {
      setState(
        () {
          _nextBtnColor = CustomColors.appColorDisabled;
        },
      );
    }
  }

  void verifyPhoneFn(verificationId) {
    setState(
      () {
        _verifyCode = true;
        _verificationId = verificationId;
      },
    );
  }

  Future<void> _authenticatePhoneNumber(AuthCredential authCredential) async {
    if (widget.authProcedure == AuthProcedure.login) {
      final loginSuccessful = await _appService.authenticateUser(
        authProcedure: AuthProcedure.login,
        buildContext: context,
        authMethod: AuthMethod.phone,
        authCredential: authCredential,
      );
      if (loginSuccessful) {
        Navigator.pop(_loadingContext);
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return const HomePage();
          }),
          (r) => false,
        );
      } else {
        Navigator.pop(_loadingContext);
        setState(
          () {
            _codeSent = true;
            _nextBtnColor = CustomColors.appColorBlue;
          },
        );
        await showSnackBar(
          context,
          'Login failed.',
        );
      }
    } else {
      final signUpSuccessful = await _appService.authenticateUser(
        authProcedure: AuthProcedure.signup,
        buildContext: context,
        authMethod: AuthMethod.phone,
        authCredential: authCredential,
      );
      if (signUpSuccessful) {
        Navigator.pop(_loadingContext);
        await Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) {
            return const ProfileSetupScreen();
          }),
          (r) => false,
        );
      } else {
        Navigator.pop(_loadingContext);
        setState(
          () {
            _codeSent = true;
            _nextBtnColor = CustomColors.appColorBlue;
          },
        );
        await showSnackBar(
          context,
          'Signup failed.',
        );
      }
    }
  }

  List<Widget> _getColumnWidget() {
    if (_verifyCode) {
      return _phoneVerificationWidget();
    }

    return _phoneInputWidget();
  }

  void _initialize() {
    setState(
      () {
        _phoneNumber = (widget.phoneNumber == null
            ? ''
            : widget.phoneNumber?.split('.').last)!;
        _countryCode = (widget.phoneNumber == null
            ? '+256'
            : widget.phoneNumber?.split('.').first)!;
        _phoneVerificationCode = <String>['', '', '', '', '', ''];
        _nextBtnColor = widget.phoneNumber == null
            ? CustomColors.appColorDisabled
            : CustomColors.appColorBlue;
        _verifyCode = false;
        _verificationId = '';
        _codeSent = false;
        _phoneInputController = TextEditingController(text: _phoneNumber);
        _showAuthOptions = true;
      },
    );
  }

  Future<void> _requestVerification() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }

    if (!_phoneFormKey.currentState!.validate()) {
      return;
    }

    final phoneNumber = '$_countryCode $_phoneNumber';
    final action = await showDialog<ConfirmationAction>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AuthMethodDialog(
          credentials: phoneNumber,
          authMethod: AuthMethod.phone,
        );
      },
    );

    if (action == null || action == ConfirmationAction.cancel) {
      return;
    }

    FocusScope.of(context).requestFocus(
      FocusNode(),
    );
    setState(
      () {
        _nextBtnColor = CustomColors.appColorDisabled;
        _codeSent = false;
        _showAuthOptions = true;
      },
    );
    loadingScreen(_loadingContext);

    if (widget.authProcedure == AuthProcedure.signup) {
      final phoneNumberTaken = await _appService.doesUserExist(
        phoneNumber: phoneNumber,
        buildContext: context,
      );

      if (phoneNumberTaken) {
        setState(
          () {
            _codeSent = true;
          },
        );
        Navigator.pop(_loadingContext);
        await showSnackBar(
          context,
          'You already have an '
          'account with this phone number',
        );
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
                opacity: animation.drive(
                  Tween<double>(begin: 0, end: 1),
                ),
                child: child,
              );
            },
          ),
          (r) => false,
        );

        return;
      }
    }

    final success = await CustomAuth.requestPhoneVerification(
      phoneNumber,
      context,
      verifyPhoneFn,
      autoVerifyPhoneFn,
    );

    Navigator.pop(_loadingContext);

    if (success) {
      setState(
        () {
          _codeSent = true;
        },
      );
    } else {
      setState(
        () {
          _codeSent = false;
        },
      );
    }

    _startCodeSentCountDown();
  }

  Future<void> _resendVerificationCode() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }

    loadingScreen(_loadingContext);

    final success = await CustomAuth.requestPhoneVerification(
      '$_countryCode$_phoneNumber',
      context,
      verifyPhoneFn,
      autoVerifyPhoneFn,
    );

    Navigator.pop(_loadingContext);

    if (success) {
      setState(
        () {
          _codeSent = true;
        },
      );
    } else {
      setState(
        () {
          _codeSent = false;
        },
      );
    }

    _startCodeSentCountDown();
  }

  void _startCodeSentCountDown() {
    setState(
      () {
        _codeSentCountDown = 5;
      },
    );
    Timer.periodic(
      const Duration(milliseconds: 1200),
      (Timer timer) {
        if (_codeSentCountDown == 0) {
          setState(
            () {
              timer.cancel();
              _codeSent = true;
            },
          );
        } else {
          setState(
            () {
              _codeSentCountDown--;
            },
          );
        }
      },
    );
  }

  Future<void> _verifySentCode() async {
    final connected = await checkNetworkConnection(
      context,
      notifyUser: true,
    );
    if (!connected) {
      return;
    }

    final code = _phoneVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(
        context,
        'Enter all the 6 digits',
      );

      return;
    }

    FocusScope.of(context).requestFocus(
      FocusNode(),
    );
    setState(
      () {
        _nextBtnColor = CustomColors.appColorDisabled;
        _showAuthOptions = true;
      },
    );

    loadingScreen(_loadingContext);

    final phoneCredential = PhoneAuthProvider.credential(
      verificationId: _verificationId,
      smsCode: _phoneVerificationCode.join(''),
    );

    await _authenticatePhoneNumber(phoneCredential);
  }
}

class PhoneLoginWidget extends PhoneAuthWidget {
  const PhoneLoginWidget({super.key, String? phoneNumber})
      : super(
          phoneNumber: phoneNumber,
          authProcedure: AuthProcedure.login,
        );

  @override
  PhoneLoginWidgetState createState() => PhoneLoginWidgetState();
}

class PhoneLoginWidgetState extends PhoneAuthWidgetState<PhoneLoginWidget> {}

class PhoneSignUpWidget extends PhoneAuthWidget {
  const PhoneSignUpWidget({super.key})
      : super(authProcedure: AuthProcedure.signup);

  @override
  PhoneSignUpWidgetState createState() => PhoneSignUpWidgetState();
}

class PhoneSignUpWidgetState extends PhoneAuthWidgetState<PhoneSignUpWidget> {}
