import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_event.dart';
import 'package:airqo/src/app/auth/pages/password_reset/password_reset.dart';


import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

import '../../bloc/ForgotPasswordBloc/forgot_password_state.dart';


class ResetLinkSentPage extends StatefulWidget {
  const ResetLinkSentPage({super.key});

  @override
  _ResetLinkSentPageState createState() => _ResetLinkSentPageState();
}

class _ResetLinkSentPageState extends State<ResetLinkSentPage> {
  final TextEditingController _pinController = TextEditingController();
  String? error;
  bool isLoading = false;

  String _maskEmail(String email) {
    if (email.isEmpty) return "your email";
    final parts = email.split('@');
    if (parts.length != 2) return email;

    String username = parts[0];
    String domain = parts[1];
    String maskedUsername = username.length > 2
        ? "${username.substring(0, 2)}${'*' * (username.length - 2)}"
        : username;

    return "$maskedUsername@$domain";
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    final isSmallScreen = screenWidth < 360;
    final isLargeScreen = screenWidth > 400;
    
    return BlocListener<PasswordResetBloc, PasswordResetState>(
      listener: (context, state) {
        if (state is PasswordResetVerified) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => PasswordResetPage(token: state.token ?? _pinController.text.trim()),
            ),
          );
        } else if (state is PasswordResetError) {
          setState(() {
            isLoading = false;
            error = state.message.replaceAll("Exception: ", "");
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(error ?? 'Verification failed'),
                backgroundColor: AppColors.primaryColor,
              ),
            );
          });
        } else if (state is PasswordResetLoading) {
          setState(() => isLoading = true);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            "Forgot Password",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color,
            ),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: EdgeInsets.only(
                  left: isSmallScreen ? 16 : 32,
                  right: isSmallScreen ? 16 : 32,
                  top: 8,
                ),
                child: Column(
                  children: [
                    Text(
                      "We just sent you a Password Reset Code to your email",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: isSmallScreen ? 18 : isLargeScreen ? 22 : 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),
                    BlocBuilder<PasswordResetBloc, PasswordResetState>(
                      builder: (context, state) {
                        String email = state.email ?? "your email";
                        String maskedEmail = _maskEmail(email);
                        return Text(
                          "Enter the verification code sent to $maskedEmail",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: isSmallScreen ? 14 : isLargeScreen ? 18 : 16,
                            fontWeight: FontWeight.w500,
                            color: Theme.of(context).textTheme.titleMedium?.color,
                          ),
                        );
                      },
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),
                    PinCodeTextField(
                      appContext: context,
                      length: 5,
                      controller: _pinController,
                      keyboardType: TextInputType.number,
                      animationType: AnimationType.fade,
                      hintCharacter: "0",
                      textStyle: TextStyle(
                        fontSize: isSmallScreen ? 24 : isLargeScreen ? 32 : 28,
                        fontWeight: FontWeight.w600,
                        color: AppColors.boldHeadlineColor3,
                      ),
                      pinTheme: PinTheme(
                        shape: PinCodeFieldShape.box,
                        borderRadius: BorderRadius.circular(4),
                        fieldHeight: isSmallScreen ? 48 : isLargeScreen ? 72 : 64,
                        fieldWidth: isSmallScreen ? 45 : isLargeScreen ? 70 : 60,
                        activeFillColor: Theme.of(context).highlightColor,
                        inactiveFillColor: Theme.of(context).highlightColor,
                        selectedFillColor: Theme.of(context).appBarTheme.backgroundColor,
                        activeColor: Theme.of(context).highlightColor,
                        inactiveColor: Theme.of(context).highlightColor,
                        selectedColor: AppColors.primaryColor,
                        fieldOuterPadding: EdgeInsets.symmetric(
                          horizontal: isSmallScreen ? 2 : isLargeScreen ? 6 : 4,
                        ),
                      ),
                      enableActiveFill: true,
                      onChanged: (value) {},
                    ),
                    SizedBox(height: isSmallScreen ? 14 : 18),
                    InkWell(
                      onTap: isLoading
                          ? null
                          : () {
                              final pin = _pinController.text.trim();
                              if (pin.length == 5) {
                                setState(() => isLoading = true);
                                context.read<PasswordResetBloc>().add(VerifyResetCodeEvent(pin));
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text('Please enter a valid 5-digit code.'),
                                    backgroundColor: AppColors.primaryColor,
                                  ),
                                );
                              }
                            },
                      child: Container(
                        height: isSmallScreen ? 48 : isLargeScreen ? 60 : 56,
                        decoration: BoxDecoration(
                          color: isLoading ? Colors.grey : AppColors.primaryColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Center(
                          child: isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  "Continue",
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white,
                                    fontSize: isSmallScreen ? 14 : isLargeScreen ? 18 : 16,
                                  ),
                                ),
                        ),
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Flexible(
                          child: Text(
                            "Didn't receive the code?",
                            style: TextStyle(
                              fontSize: isSmallScreen ? 12 : isLargeScreen ? 16 : 14,
                              fontWeight: FontWeight.w500,
                              color: Theme.of(context).textTheme.headlineLarge?.color,
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: isLoading
                              ? null
                              : () {
                                  final email = context.read<PasswordResetBloc>().state.email;
                                  if (email != null && email.isNotEmpty) {
                                    context.read<PasswordResetBloc>().add(RequestPasswordReset(email));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text("Code resent.")),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text("No email found to resend code.")),
                                    );
                                  }
                                },
                          child: Center(
                            child: Text(
                              " Resend",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                color: AppColors.primaryColor,
                                fontSize: isSmallScreen ? 12 : isLargeScreen ? 16 : 14,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),
                ],
              ),
            ),
              SizedBox(height: isSmallScreen ? 16 : 24),
            ],
          ),
        ),
      ),
    );
  }
}