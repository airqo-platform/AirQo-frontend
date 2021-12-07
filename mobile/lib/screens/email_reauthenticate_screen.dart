import 'package:app/constants/config.dart';
import 'package:app/models/user_details.dart';
import 'package:app/services/fb_notifications.dart';
import 'package:app/services/rest_api.dart';
import 'package:app/utils/dialogs.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/text_fields.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class EmailReAuthenticateScreen extends StatefulWidget {
  UserDetails userDetails;

  EmailReAuthenticateScreen(
    this.userDetails, {
    Key? key,
  }) : super(key: key);

  @override
  EmailReAuthenticateScreenState createState() =>
      EmailReAuthenticateScreenState();
}

class EmailReAuthenticateScreenState extends State<EmailReAuthenticateScreen> {
  bool _isVerifying = false;
  bool _isResending = false;
  int _emailToken = 1;
  var _emailVerificationLink = '';
  var _showResendCode = false;
  var _emailVerificationCode = <String>['', '', '', '', '', ''];
  var _nextBtnColor = Config.appColorDisabled;

  final CustomAuth _customAuth = CustomAuth();
  AirqoApiClient? _airqoApiClient;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      color: Colors.white,
      padding: const EdgeInsets.only(left: 24, right: 24),
      child: Center(
          child: Column(children: [
        const SizedBox(
          height: 20,
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
        Text(
          'Enter the 6 digit code sent to\n'
          'your email address',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Colors.black.withOpacity(0.6)),
        ),
        const SizedBox(
          height: 32,
        ),
        Padding(
          padding: const EdgeInsets.only(left: 36, right: 36),
          child: optField(0, context, setCode, true),
        ),
        const SizedBox(
          height: 24,
        ),
        Visibility(
          visible: !_showResendCode,
          child: Text(
            'The code should arrive with in 10 sec',
            textAlign: TextAlign.center,
            style:
                TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.5)),
          ),
        ),
        Visibility(
          visible: _showResendCode,
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
        const Spacer(),
        GestureDetector(
          onTap: () async {
            await verifySentCode();
          },
          child: nextButton('Verify', _nextBtnColor),
        ),
        const SizedBox(
          height: 20,
        ),
        cancelOption(),
        const SizedBox(
          height: 20,
        ),
      ])),
    ));
  }

  Widget cancelOption() {
    return GestureDetector(
      onTap: () {
        Navigator.pop(context, false);
      },
      child: Text(
        'Cancel',
        textAlign: TextAlign.center,
        style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Config.appColorBlue),
      ),
    );
  }

  void initialize() {
    setState(() {
      _isVerifying = false;
      _isResending = false;
      _emailToken = 000000;
      _emailVerificationLink = '';
      _showResendCode = false;
      _emailVerificationCode = <String>['', '', '', '', '', ''];
      _nextBtnColor = Config.appColorDisabled;
    });
  }

  @override
  void initState() {
    _airqoApiClient = AirqoApiClient(context);
    initialize();
    _requestVerification();
    super.initState();
  }

  Future<void> resendVerificationCode() async {
    setState(() {
      _isResending = true;
    });

    var emailVerificationResponse = await _airqoApiClient!
        .requestEmailVerificationCode(widget.userDetails.emailAddress, true);

    if (emailVerificationResponse == null) {
      await showSnackBar(context, 'Email verification failed');
      return;
    }
    setState(() {
      _isResending = false;
      _emailToken = emailVerificationResponse.token;
      _emailVerificationLink = emailVerificationResponse.authLink;
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

    var success = await _customAuth.reAuthenticateWithEmailAddress(
        widget.userDetails.emailAddress, _emailVerificationLink, context);
    if (success) {
      Navigator.pop(context, true);
    } else {
      setState(() {
        _nextBtnColor = Config.appColorBlue;
        _isVerifying = false;
      });
      await showSnackBar(
          context,
          'Failed to verify email address.'
          ' Try again later');
    }
  }

  Future<void> _requestVerification() async {
    if (_isVerifying) {
      return;
    }

    setState(() {
      _nextBtnColor = Config.appColorDisabled;
      _isVerifying = true;
    });

    var emailVerificationResponse = await _airqoApiClient!
        .requestEmailVerificationCode(widget.userDetails.emailAddress, true);

    if (!mounted) {
      return;
    }

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
      _emailVerificationLink = emailVerificationResponse.authLink;
      _isVerifying = false;
      _showResendCode = false;
    });

    Future.delayed(const Duration(seconds: 5), () {
      setState(() {
        _showResendCode = true;
      });
    });
  }
}
