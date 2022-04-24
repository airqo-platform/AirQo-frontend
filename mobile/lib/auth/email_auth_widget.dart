import 'dart:async';

import 'package:app/auth/phone_auth_widget.dart';
import 'package:app/constants/config.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

import '../models/enum_constants.dart';
import '../themes/light_theme.dart';
import '../widgets/custom_shimmer.dart';

class EmailAuthWidget extends StatefulWidget {
  final String? emailAddress;
  final AuthProcedure authProcedure;

  const EmailAuthWidget(
      {Key? key, this.emailAddress, required this.authProcedure})
      : super(key: key);

  @override
  EmailAuthWidgetState createState() => EmailAuthWidgetState();
}

class EmailAuthWidgetState<T extends EmailAuthWidget> extends State<T> {
  String _emailVerificationLink = '';
  int _emailToken = 1;
  bool _verifyCode = false;
  bool _codeSent = false;
  List<String> _emailVerificationCode = <String>['', '', '', '', '', ''];
  final _emailFormKey = GlobalKey<FormState>();

  late TextEditingController _emailInputController;
  final AppService _appService = AppService();
  late String _emailAddress;
  late Color _nextBtnColor;
  DateTime? _exitTime;
  late BuildContext loadingContext;
  bool _showAuthOptions = true;
  String _authOptionsText = '';
  String _authOptionsButtonText = '';
  int _codeSentCountDown = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WillPopScope(
            onWillPop: onWillPop,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.only(left: 24, right: 24),
              child: Center(child: Column(children: _getColumnWidget())),
            )));
  }

  void clearEmailCallBack() {
    if (_emailAddress == '') {
      FocusScope.of(context).unfocus();
      Future.delayed(const Duration(milliseconds: 400), () {
        setState(() {
          _showAuthOptions = true;
        });
      });
    }

    setState(() {
      _emailAddress = '';
      _emailInputController.text = '';
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  Widget emailInputField() {
    return TextFormField(
      controller: _emailInputController,
      onTap: () {
        setState(() {
          _showAuthOptions = false;
        });
      },
      onEditingComplete: () async {
        FocusScope.of(context).requestFocus(FocusNode());
        Future.delayed(const Duration(milliseconds: 400), () {
          setState(() {
            _showAuthOptions = true;
          });
        });
      },
      onChanged: emailValueChange,
      style: Theme.of(context).textTheme.bodyText1,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Enter your email address';
        } else if (!value.isValidEmail()) {
          showSnackBar(context, 'Invalid email address');
          return 'Invalid email address';
        } else {
          return null;
        }
      },
      enableSuggestions: true,
      cursorWidth: 1,
      autofocus: false,
      cursorColor: Config.appColorBlue,
      keyboardType: TextInputType.emailAddress,
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
        hintText: 'Enter your email',
        hintStyle: Theme.of(context)
            .textTheme
            .bodyText1
            ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
        prefixStyle: Theme.of(context)
            .textTheme
            .bodyText1
            ?.copyWith(color: Config.appColorBlack.withOpacity(0.32)),
        suffixIcon: GestureDetector(
          onTap: clearEmailCallBack,
          child: textInputCloseButton(),
        ),
        errorStyle: const TextStyle(
          fontSize: 0,
        ),
      ),
    );
  }

  List<Widget> emailInputWidget() {
    return [
      const SizedBox(
        height: 56,
      ),
      AutoSizeText(
        _authOptionsText,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline7(context),
      ),
      const SizedBox(
        height: 8,
      ),
      AutoSizeText('We’ll send you a verification code',
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context)
              .textTheme
              .bodyText2
              ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
      const SizedBox(
        height: 32,
      ),
      Form(
        key: _emailFormKey,
        child: emailInputField(),
      ),
      const SizedBox(
        height: 32,
      ),
      GestureDetector(
        onTap: () {
          setState(() {
            Navigator.pushAndRemoveUntil(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) {
                    if (widget.authProcedure == AuthProcedure.login) {
                      return const PhoneLoginWidget(
                        phoneNumber: '',
                      );
                    }
                    return const PhoneSignUpWidget();
                  },
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) {
                    return FadeTransition(
                      opacity: animation.drive(Tween<double>(begin: 0, end: 1)),
                      child: child,
                    );
                  },
                ),
                (r) => false);
          });
        },
        child: signButton(text: _authOptionsButtonText, context: context),
      ),
      const Spacer(),
      GestureDetector(
        onTap: () async {
          await _requestVerification();
        },
        child: nextButton('Next', _nextBtnColor),
      ),
      Visibility(
        visible: _showAuthOptions,
        child: const SizedBox(
          height: 16,
        ),
      ),
      Visibility(
        visible: _showAuthOptions,
        child: widget.authProcedure == AuthProcedure.login
            ? loginOptions(context: context)
            : signUpOptions(context: context),
      ),
      SizedBox(
        height: _showAuthOptions ? 40 : 12,
      ),
    ];
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

  List<Widget> emailVerificationWidget() {
    return [
      const SizedBox(
        height: 56,
      ),
      AutoSizeText(
        'Verify your account',
        textAlign: TextAlign.center,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: CustomTextStyle.headline7(context),
      ),
      const SizedBox(
        height: 8,
      ),
      AutoSizeText(
          'Enter the 6 digit code sent to your email\n'
          '$_emailAddress',
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context)
              .textTheme
              .bodyText2
              ?.copyWith(color: Config.appColorBlack.withOpacity(0.6))),
      const SizedBox(
        height: 32,
      ),
      Padding(
        padding: const EdgeInsets.only(left: 36, right: 36),
        child: optField(0, context, setCode, _codeSent),
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
          'Change your email',
          textAlign: TextAlign.center,
          style: Theme.of(context)
              .textTheme
              .caption
              ?.copyWith(color: Config.appColorBlue),
        ),
      ),
      const Spacer(),
      GestureDetector(
        onTap: () async {
          await verifySentCode();
        },
        child: nextButton('Next', _nextBtnColor),
      ),
      const SizedBox(
        height: 12,
      ),
    ];
  }

  @override
  void initState() {
    super.initState();
    loadingContext = context;
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

    Navigator.pop(loadingContext);

    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) {
      return HomePage();
    }), (r) => false);

    return Future.value(false);
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
    var connected = await _appService.isConnected(context);
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    var code = _emailVerificationCode.join('');

    if (code.length != 6) {
      await showSnackBar(context, 'Enter all the 6 digits');
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
    });

    if (code != _emailToken.toString()) {
      await showSnackBar(context, 'Invalid Code');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
      return;
    }

    loadingScreen(loadingContext);

    bool success;
    if (widget.authProcedure == AuthProcedure.signup) {
      success = await _appService.authenticateUser(
          emailAuthLink: _emailVerificationLink,
          emailAddress: _emailAddress,
          authMethod: AuthMethod.email,
          authProcedure: AuthProcedure.signup,
          buildContext: context);
    } else {
      success = await _appService.authenticateUser(
          emailAuthLink: _emailVerificationLink,
          emailAddress: _emailAddress,
          authMethod: AuthMethod.email,
          authProcedure: AuthProcedure.login,
          buildContext: context);
    }

    Navigator.pop(loadingContext);

    if (success) {
      if (widget.authProcedure == AuthProcedure.signup) {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const ProfileSetupScreen();
        }), (r) => false);
      } else {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return HomePage();
        }), (r) => false);
      }
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _codeSent = true;
      });
      await showSnackBar(context, 'Authentication failed');
    }
  }

  List<Widget> _getColumnWidget() {
    if (_verifyCode) {
      return emailVerificationWidget();
    }
    return emailInputWidget();
  }

  void _initialize() {
    setState(() {
      _emailAddress = widget.emailAddress ?? '';
      _nextBtnColor = widget.emailAddress == null
          ? Config.appColorDisabled
          : Config.appColorBlue;
      _emailVerificationLink = '';
      _emailToken = 1;
      _verifyCode = false;
      _codeSent = false;
      _emailVerificationCode = <String>['', '', '', '', '', ''];

      _emailInputController = TextEditingController(text: _emailAddress);

      _showAuthOptions = true;
      _authOptionsText = widget.authProcedure == AuthProcedure.login
          ? 'Login with your email or mobile number'
          : 'Sign up with your email or mobile number';
      _authOptionsButtonText = widget.authProcedure == AuthProcedure.login
          ? 'Login with a mobile number instead'
          : 'Sign up with a mobile number instead';
    });
  }

  Future<void> _requestVerification() async {
    var connected = await _appService.isConnected(context);
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    if (!_emailFormKey.currentState!.validate()) {
      return;
    }

    FocusScope.of(context).requestFocus(FocusNode());
    Future.delayed(const Duration(milliseconds: 400), () {
      setState(() {
        _showAuthOptions = true;
      });
    });

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
    });
    loadingScreen(loadingContext);

    if (widget.authProcedure == AuthProcedure.signup) {
      var emailExists = await _appService.doesUserExist(
          emailAddress: _emailAddress, buildContext: context);

      if (emailExists) {
        setState(() {
          _nextBtnColor = Config.appColorBlue;
        });
        Navigator.pop(loadingContext);
        await showSnackBar(
            context,
            'You already have an '
            'account with this email address');
        await Navigator.pushAndRemoveUntil(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  EmailLoginWidget(emailAddress: _emailAddress),
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

    var emailSignupResponse = await _appService.apiClient
        .requestEmailVerificationCode(_emailAddress, false);

    Navigator.pop(loadingContext);

    if (emailSignupResponse == null) {
      await showSnackBar(context, 'email signup verification failed');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
      });
      return;
    }

    setState(() {
      _emailVerificationLink = emailSignupResponse.loginLink;
      _emailToken = emailSignupResponse.token;
      _verifyCode = true;
      _codeSent = false;
    });

    _startCodeSentCountDown();
  }

  Future<void> _resendVerificationCode() async {
    var connected = await _appService.isConnected(context);
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    loadingScreen(loadingContext);

    var emailSignupResponse = await _appService.apiClient
        .requestEmailVerificationCode(_emailAddress, false);

    Navigator.pop(loadingContext);

    if (emailSignupResponse == null) {
      await showSnackBar(context, 'Email signup verification failed');
      return;
    }

    setState(() {
      _emailVerificationLink = emailSignupResponse.loginLink;
      _emailToken = emailSignupResponse.token;
    });
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
}

class EmailLoginWidget extends EmailAuthWidget {
  const EmailLoginWidget({Key? key, String? emailAddress})
      : super(
            key: key,
            emailAddress: emailAddress,
            authProcedure: AuthProcedure.login);

  @override
  EmailLoginWidgetState createState() => EmailLoginWidgetState();
}

class EmailLoginWidgetState extends EmailAuthWidgetState<EmailLoginWidget> {}

class EmailSignUpWidget extends EmailAuthWidget {
  const EmailSignUpWidget({Key? key})
      : super(key: key, authProcedure: AuthProcedure.signup);

  @override
  EmailSignUpWidgetState createState() => EmailSignUpWidgetState();
}

class EmailSignUpWidgetState extends EmailAuthWidgetState<EmailSignUpWidget> {}
