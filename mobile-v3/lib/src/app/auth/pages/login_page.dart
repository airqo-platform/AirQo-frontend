import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/shared/pages/nav_page.dart';
import 'package:airqo/src/app/shared/widgets/form_field.dart';
import 'package:airqo/src/app/shared/widgets/spinner.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loggy/loggy.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String? error;
  late AuthBloc authBloc;
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  GlobalKey<FormState> formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    try {
      authBloc = context.read<AuthBloc>();
    } catch (e) {
      logError('Failed to initialize AuthBloc: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoaded) {
          Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(
            builder: (context) {
              return NavPage();
            },
          ), (_) => false);
        } else if (state is AuthLoadingError) {
          setState(() {
            error = state.message.replaceAll("Exception: ", "");
          });
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            "Login",
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.boldHeadlineColor),
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
                            controller: passwordController)
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
                child: BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) {
                    bool loading = state is AuthLoading;

                    return InkWell(
                      onTap: loading
                          ? null
                          : () {
                              final currentForm = formKey.currentState;
                              if (currentForm != null &&
                                  currentForm.validate()) {
                                authBloc?.add(LoginUser(
                                    emailController.text.trim(),
                                    passwordController.text.trim()));
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
                                  "Login",
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
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text("Don't have an account?",
                    style: TextStyle(
                        color: AppColors.boldHeadlineColor,
                        fontWeight: FontWeight.w500)),
                InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => CreateAccountScreen())),
                  child: Text(
                    "Create Account",
                    style: TextStyle(
                        fontWeight: FontWeight.w500,
                        color: AppColors.primaryColor),
                  ),
                )
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
