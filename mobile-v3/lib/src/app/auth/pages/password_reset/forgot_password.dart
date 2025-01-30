import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_event.dart';
import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_state.dart';
import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/auth/pages/password_reset/reset_link_sent.dart';

import 'package:airqo/src/app/shared/pages/nav_page.dart';
import 'package:airqo/src/app/shared/widgets/form_field.dart';
import 'package:airqo/src/app/shared/widgets/spinner.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPage();
}

class _ForgotPasswordPage extends State<ForgotPasswordPage> {
  String? error;
  late PasswordResetBloc passwordResetBloc;
  late TextEditingController emailController = TextEditingController();

  late GlobalKey<FormState> formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    emailController = TextEditingController();


    try {
      passwordResetBloc = context.read<PasswordResetBloc>();

    } catch (e) {
      logError('Failed to initialize PasswordResetBloc: $e');
    }
  }

  @override
  void dispose() {
    emailController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PasswordResetBloc, PasswordResetState>(
      listener: (context, state) {
        if (state is PasswordResetSuccess) {
          Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (context) => ResetLinkSentPage()));
        } else if (state is PasswordResetError) {
          setState(() {
            error = state.message.replaceAll("Exception: ", "");
          });
        }
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
          title: Text(
            "Forgot Password",
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.boldHeadlineColor2),
          ),
          centerTitle: true,


        ),

        body: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                child: Padding(
                  padding: const EdgeInsets.only(left: 32, right: 32, top: 8),
                  child: SizedBox(
                    child: Column(
                      children: [
                        Text("Forgot Your Password?",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.highlightColor2
                        ),
                        ),
                        SizedBox(
                          height: 12,
                        ),
                        Text("Enter your email address and we will send you a code to reset your password.",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                              color: AppColors.highlightColor2
                          ),
                        ),
                        SizedBox(height: 32),
                        FormFieldWidget(
                            prefixIcon: Container(
                              padding: const EdgeInsets.all(13.5),
                              child: SvgPicture.asset(
                                "assets/icons/email-icon.svg",
                                height: 10,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return "This field cannot be blank.";
                              }
                              return null;
                            },
                            hintText: "Enter your email",
                            label: "Email*",
                            controller: emailController),
                        SizedBox(height: 18),

                      ],
                    ),
                  ),
                ),
              ),
              if (error != null)
                Padding(
                  padding: const EdgeInsets.only(left: 32.0, top: 8),
                  child: Text(error!, style: TextStyle(color: Colors.red)),
                ),
              SizedBox(height: 18),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32.0),
                child: BlocBuilder<PasswordResetBloc, PasswordResetState>(
                  builder: (context, state) {
                    bool loading = state is PasswordResetLoading;

                    return InkWell(
                      onTap: loading
                          ? null
                          : () {
                        final currentForm = formKey.currentState;
                        if (currentForm != null &&
                            currentForm.validate()) {
                          passwordResetBloc.add(RequestPasswordReset(
                              emailController.text.trim()
                          ));

                          emailController.clear();


                        }
                      },
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                            color: AppColors.primaryColor,
                            borderRadius: BorderRadius.circular(4)),
                        child: Center(
                          child: loading
                              ? Spinner()
                              : Text(
                            "Submit",
                            style: TextStyle(
                              fontWeight: FontWeight.w500,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              SizedBox(
                  height: 18
              ),

              InkWell(
                onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => LoginPage())),
                child: Center(
                  child: Text(
                    "Login",
                    style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: AppColors.primaryColor),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
