import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/shared/widgets/airqo_button.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String email;

  const EmailVerificationScreen({super.key, required this.email});

  @override
  State<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final TextEditingController _codeController = TextEditingController();
  bool _isVerifying = false;
  String? _errorMessage;

  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    
    String username = parts[0];
    String domain = parts[1];
    String maskedUsername = username.length > 2
        ? "${username.substring(0, 2)}${'*' * (username.length - 2)}"
        : username;
    
    return "$maskedUsername@$domain";
  }

  void _verifyCode() {
    if (_codeController.text.isEmpty) {
      setState(() {
        _errorMessage = "Please enter the verification code";
      });
      return;
    }

    // Validate 5-digit numeric code
    if (_codeController.text.length != 5 || !RegExp(r'^\d{5}$').hasMatch(_codeController.text)) {
      setState(() {
        _errorMessage = "Please enter a valid 5-digit code";
      });
      return;
    }

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    context.read<AuthBloc>().add(VerifyEmailCode(_codeController.text, widget.email));
  }


  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthVerified) {
          setState(() {
            _isVerifying = false;
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Email verified successfully!'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
          
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const LoginPage()),
            (route) => false,
          );
        } else if (state is AuthLoadingError) {
          setState(() {
            _isVerifying = false;
            _errorMessage = state.message;
          });
        } else if (state is AuthLoading) {
          setState(() {
            _isVerifying = true;
          });
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            "Verify Your Email",
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.boldHeadlineColor,
            ),
          ),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    color: AppColors.highlightColor,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: SvgPicture.asset(
                      'assets/icons/email-icon.svg',
                      height: 30,
                      width: 30,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                Text(
                  "Please verify your email address",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).textTheme.headlineLarge?.color,
                  ),
                ),
                
                const SizedBox(height: 12),
                
                Text(
                  "Enter the 5-digit verification code sent to ${_maskEmail(widget.email)}",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Theme.of(context).textTheme.bodyMedium?.color,
                  ),
                ),
                
                const SizedBox(height: 40),
                
                PinCodeTextField(
                  appContext: context,
                  length: 5,
                  controller: _codeController,
                  keyboardType: TextInputType.number,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(8),
                    fieldHeight: 56,
                    fieldWidth: 50,
                    activeFillColor: Theme.of(context).highlightColor,
                    inactiveFillColor: Theme.of(context).highlightColor,
                    selectedFillColor: Theme.of(context).highlightColor,
                    activeColor: AppColors.primaryColor,
                    inactiveColor: Theme.of(context).dividerColor,
                    selectedColor: AppColors.primaryColor,
                  ),
                  textStyle: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).textTheme.bodyLarge?.color,
                  ),
                  enableActiveFill: true,
                  onChanged: (value) {
                    // Clear error when typing
                    if (_errorMessage != null) {
                      setState(() {
                        _errorMessage = null;
                      });
                    }
                  },
                ),
                
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8, bottom: 8),
                    child: Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                      ),
                    ),
                  ),
                
                const SizedBox(height: 32),
                
                _isVerifying 
                ? Center(child: CircularProgressIndicator(color: AppColors.primaryColor))
                : AirQoButton(
                    label: "Verify Email",
                    textColor: Colors.white,
                    color: AppColors.primaryColor,
                    onPressed: _verifyCode,
                  ),
                
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}