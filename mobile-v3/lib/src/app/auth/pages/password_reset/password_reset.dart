import 'package:airqo/src/app/auth/bloc/ForgotPasswordBloc/forgot_password_event.dart';

import 'package:airqo/src/app/auth/pages/password_reset/reset_success.dart';
import 'package:airqo/src/app/shared/widgets/form_field.dart';
import 'package:airqo/src/app/shared/widgets/spinner.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';

import '../../bloc/ForgotPasswordBloc/forgot_password_bloc.dart';
import '../../bloc/ForgotPasswordBloc/forgot_password_state.dart';

class PasswordResetPage extends StatefulWidget {
  final String token;
  const PasswordResetPage({super.key, required this.token});

  @override
  State<PasswordResetPage> createState() => _PasswordResetPage();
}

class _PasswordResetPage extends State<PasswordResetPage> {

  String? error;
  late PasswordResetBloc passwordResetBloc;
  late TextEditingController passwordConfirmController = TextEditingController();
  late TextEditingController passwordController = TextEditingController();
  late TextEditingController resetController= TextEditingController();
  late GlobalKey<FormState> formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    passwordConfirmController = TextEditingController();
    passwordController = TextEditingController();
    resetController= TextEditingController();

    try {
      passwordResetBloc = context.read<PasswordResetBloc>();

    } catch (e) {
      logError('Failed to initialize PasswordResetBloc: $e');
    }
  }

  @override
  void dispose() {
    passwordConfirmController.dispose();
    passwordController.dispose();
    resetController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<PasswordResetBloc, PasswordResetState>(
      listener: (context, state) {
        if (state is PasswordResetSuccess) {
          Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (context) => ResetSuccessPage()));
        } else if (state is PasswordResetError) {
          setState(() {
            error = state.message.replaceAll("Exception: ", "");
          });
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            "Reset Password",
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
              color: Theme.of(context).textTheme.headlineLarge?.color
                ),
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

                        Text("Reset your password",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: Theme.of(context).textTheme.titleMedium?.color
                          ),
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        Text("Please enter your new password below. Make sure it's something secure that you can remember.",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: Theme.of(context).textTheme.titleMedium?.color
                          ),
                        ),

                        SizedBox(height: 16),
                        FormFieldWidget(
                            prefixIcon: Container(
                              padding: const EdgeInsets.all(13.5),
                              child: SvgPicture.asset(
                                "assets/icons/password.svg",
                                height: 10,
                              ),
                            ),
                            validator: (value) {

                              if (value == null || value.isEmpty) {
                                return "This field cannot be blank.";
                              }
                              return null;
                            },
                            hintText: "Enter your password",
                            label: "Password",
                            isPassword: true,
                            controller: passwordController),
                        SizedBox(height: 16),
                        FormFieldWidget(
                            prefixIcon: Container(
                              padding: const EdgeInsets.all(13.5),
                              child: SvgPicture.asset(
                                "assets/icons/password.svg",
                                height: 10,
                              ),
                            ),
                            validator: (value) {
                              if(value != passwordController.text){
                                return "Passwords do not match";
                              }

                              if (value == null || value.isEmpty) {
                                return "This field cannot be blank.";
                              }
                              return null;
                            },
                            hintText: "Re-enter your new password",
                            label: "Confirm Password",
                            isPassword: true,
                            controller: passwordConfirmController),
                        SizedBox(height: 16),
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
              SizedBox(height: 24),
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
                          passwordResetBloc.add(UpdatePassword(
                              confirmPassword: passwordConfirmController.text.trim(),
                              token: widget.token,
                              password:passwordController.text.trim()));

                        }
                        resetController.clear();
                        passwordConfirmController.clear();
                        passwordController.clear();
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
                            "Reset Password",
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
              SizedBox(height: 16),

            ],
          ),
        ),
      ),
    );
  }
}
