import 'package:app/constants/config.dart';
import 'package:app/on_boarding/profile_setup_screen.dart';
import 'package:app/screens/home_page.dart';
import 'package:app/services/app_service.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/utils/extensions.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';

class EmailAuthWidget extends StatefulWidget {
  final ValueSetter<String> changeOption;
  final bool enableBackButton;
  final String action;

  const EmailAuthWidget(
    this.enableBackButton,
    this.changeOption,
    this.action, {
    Key? key,
  }) : super(key: key);

  @override
  EmailAuthWidgetState createState() => EmailAuthWidgetState();
}

class EmailAuthWidgetState extends State<EmailAuthWidget> {
  bool _emailFormValid = false;
  String _emailAddress = '';
  bool _isVerifying = false;
  bool _isResending = false;
  String _emailVerificationLink = '';
  int _emailToken = 1;
  bool _verifyCode = false;
  bool _codeSent = false;
  List<String> _emailVerificationCode = <String>['', '', '', '', '', ''];
  Color _nextBtnColor = Config.appColorDisabled;

  final _emailFormKey = GlobalKey<FormState>();
  final TextEditingController _emailInputController = TextEditingController();
  late AppService _appService;

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
            'Verify your email address!',
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

        Visibility(
          visible: _verifyCode,
          child: Text(
            'Enter the 6 digit code sent to\n'
            '$_emailAddress',
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
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style:
                  TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
            )),

        const SizedBox(
          height: 32,
        ),
        // End Common widgets

        // input fields
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
            key: _emailFormKey,
            child: emailInputField(),
          ),
        ),
        // end input fields

        const SizedBox(
          height: 32,
        ),

        Visibility(
          visible: !_codeSent && _verifyCode,
          child: Text(
            'The code should arrive with in 10 sec',
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
        Visibility(
          visible: !_verifyCode,
          child: GestureDetector(
            onTap: () {
              setState(() {
                initialize();
                widget.changeOption('phone');
              });
            },
            child: widget.action == 'signup'
                ? signButton('Sign up with a mobile number instead')
                : signButton('Login with a mobile number instead'),
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
              'Change Email Address',
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: 12,
                  color: _codeSent
                      ? Config.appColorBlue
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
              showSnackBar(context, 'Please enter your email address');
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
            hintText: 'Enter your email',
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
      _emailVerificationLink = '';
      _emailToken = 1;
      _verifyCode = false;
      _codeSent = false;
      _emailVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  @override
  void initState() {
    _appService = AppService(context);
    initialize();
    super.initState();
  }

  Future<void> requestVerification() async {
    var connected = await _appService.isConnected();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

    _emailFormKey.currentState!.validate();

    if (!_emailFormValid || _isVerifying) {
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
    });

    if (widget.action == 'signup') {
      var emailExists =
          await _appService.customAuth.userExists(null, _emailAddress);

      if (emailExists) {
        setState(() {
          _nextBtnColor = Config.appColorBlue;
          _isVerifying = false;
        });
        await showSnackBar(
            context,
            'Email Address already taken. '
            'Try logging in');
        return;
      }
    }

    var emailSignupResponse = await _appService.apiClient
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailSignupResponse == null) {
      await showSnackBar(context, 'email signup verification failed');
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      return;
    }

    setState(() {
      _emailVerificationLink = emailSignupResponse.loginLink;
      _emailToken = emailSignupResponse.token;
      _verifyCode = true;
      _isVerifying = false;
      _codeSent = false;
    });

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _codeSent = true;
      });
    });
  }

  Future<void> resendVerificationCode() async {
    var connected = await _appService.isConnected();
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

    var emailSignupResponse = await _appService.apiClient
        .requestEmailVerificationCode(_emailAddress, false);

    if (emailSignupResponse == null) {
      await showSnackBar(context, 'Email signup verification failed');
      return;
    }
    setState(() {
      _isResending = false;
      _emailVerificationLink = emailSignupResponse.loginLink;
      _emailToken = emailSignupResponse.token;
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
    var connected = await _appService.isConnected();
    if (!connected) {
      await showSnackBar(context, Config.connectionErrorMessage);
      return;
    }

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

    var success = false;
    if (widget.action == 'signup') {
      success = await _appService.signup(
          null, _emailAddress, _emailVerificationLink, authMethod.email);
    } else {
      success = await _appService.login(
          null, _emailAddress, _emailVerificationLink, authMethod.email);
    }

    if (success) {
      if (widget.action == 'signup') {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return ProfileSetupScreen(widget.enableBackButton);
        }), (r) => false);
      } else {
        await Navigator.pushAndRemoveUntil(context,
            MaterialPageRoute(builder: (context) {
          return const HomePage();
        }), (r) => false);
      }
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      await showSnackBar(context, 'Try again later');
    }
  }
}
