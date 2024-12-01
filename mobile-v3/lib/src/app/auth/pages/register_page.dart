import 'package:airqo/src/app/auth/bloc/auth_bloc.dart';
import 'package:airqo/src/app/auth/models/input_model.dart';
import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/shared/widgets/airqo_button.dart';
import 'package:airqo/src/app/shared/widgets/form_field.dart';
import 'package:airqo/src/app/shared/widgets/spinner.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/flutter_svg.dart';

class CreateAccountScreen extends StatefulWidget {
  const CreateAccountScreen({super.key});

  @override
  State<CreateAccountScreen> createState() => _CreateAccountScreenState();
}

class _CreateAccountScreenState extends State<CreateAccountScreen> {
  int currentIndex = 0;
  PageController? controller;

  TextEditingController firstNameController = TextEditingController();
  TextEditingController lastNameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  GlobalKey<FormState> accountKey = GlobalKey<FormState>();
  GlobalKey<FormState> dataKey = GlobalKey<FormState>();

  AuthBloc? authBloc;

  void changeIndex(int index) {
    setState(() {
      currentIndex = index;
    });
  }

  @override
  void initState() {
    controller = PageController();
    authBloc = context.read<AuthBloc>();
    super.initState();
  }

  @override
  void dispose() {
    controller!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthLoaded) {
          controller!.jumpToPage(2);
        } else if (state is AuthLoadingError) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back_ios),
            onPressed: () {
              if (currentIndex == 1) {
                controller!.jumpTo(0);
              } else {
                Navigator.pop(context);
              }
            },
          ),
          title: Text(
            "Create Account",
            style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.boldHeadlineColor),
          ),
          centerTitle: true,
        ),
        body: Column(
          children: [
            SizedBox(height: 16),
            Container(
                alignment: Alignment.center,
                height: 6,
                width: MediaQuery.of(context).size.width,
                child: StepperWidget(currentIndex: currentIndex, count: 3)),
            Expanded(
              child: Container(
                child: Padding(
                  padding: const EdgeInsets.only(left: 32, right: 32, top: 20),
                  child: PageView(
                    physics: const NeverScrollableScrollPhysics(),
                    scrollDirection: Axis.horizontal,
                    controller: controller,
                    onPageChanged: changeIndex,
                    children: [
                      SizedBox(
                        child: Form(
                          key: dataKey,
                          child: Column(
                            children: [
                              SizedBox(height: 32),
                              FormFieldWidget(
                                  validator: (value) {
                                    if (value!.length == 0) {
                                      return "First Name is required.";
                                    }
                                    return null;
                                  },
                                  hintText: "Enter your first name",
                                  label: "First Name*",
                                  controller: firstNameController),
                              SizedBox(height: 16),
                              FormFieldWidget(
                                  validator: (value) {
                                    if (value!.length == 0) {
                                      return "Last name is required.";
                                    }
                                    return null;
                                  },
                                  hintText: "Enter your last name",
                                  label: "Last Name*",
                                  controller: lastNameController),
                              SizedBox(height: 32),
                              InkWell(
                                onTap: () {
                                  if (dataKey.currentState!.validate()) {
                                    controller!.jumpToPage(currentIndex + 1);
                                  }
                                },
                                child: Container(
                                  height: 56,
                                  decoration: BoxDecoration(
                                      color: AppColors.primaryColor,
                                      borderRadius: BorderRadius.circular(4)),
                                  child: Center(
                                    child: Text(
                                      "Next",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w500,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                      ),
                      SizedBox(
                        child: Form(
                          key: accountKey,
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
                                  hintText: "Enter your email",
                                  label: "Email*",
                                  validator: (value) {
                                    if (value!.length == 0) {
                                      return "Email is required";
                                    }
                                    return null;
                                  },
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
                                  String val = value ?? "";
                                  if (val.isEmpty) {
                                    return 'Please enter a password';
                                  }
                                  if (!val.contains(RegExp(r'[a-zA-Z]'))) {
                                    return 'Password must contain at least one letter';
                                  }
                                  if (!val.contains(RegExp(r'[0-9]'))) {
                                    return 'Password must contain at least one number';
                                  }
                                  if (val.length < 6) {
                                    return 'Password must be at least 6 characters long';
                                  }
                                  if (val.length > 30) {
                                    return 'Password must be at most 30 characters long';
                                  }
                                  return null;
                                },
                                hintText: "Create your password",
                                label: "Password",
                                isPassword: true,
                                controller: passwordController,
                              ),
                              SizedBox(height: 32),
                              BlocBuilder<AuthBloc, AuthState>(
                                builder: (context, state) {
                                  bool loading = state is AuthLoading;
                                  return InkWell(
                                    onTap: loading
                                        ? null
                                        : () {
                                            if (accountKey.currentState!
                                                .validate()) {
                                              if (currentIndex == 1) {
                                                RegisterInputModel model =
                                                    new RegisterInputModel(
                                                        category: "individual",
                                                        email: emailController.text
                                                            .trim(),
                                                        password:
                                                            passwordController
                                                                .text
                                                                .trim(),
                                                        firstName:
                                                            firstNameController
                                                                .text
                                                                .trim(),
                                                        lastName:
                                                            lastNameController
                                                                .text
                                                                .trim());
                                                authBloc!
                                                    .add(RegisterUser(model));
                                              } else {
                                                controller!.jumpToPage(
                                                    currentIndex + 1);
                                              }
                                            }
                                          },
                                    child: Container(
                                      height: 56,
                                      decoration: BoxDecoration(
                                          color: AppColors.primaryColor,
                                          borderRadius:
                                              BorderRadius.circular(4)),
                                      child: Center(
                                        child: loading
                                            ? Spinner()
                                            : Text(
                                                "Create Account",
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
                              SizedBox(height: 16),
                              Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text("Already have an account?",
                                        style: TextStyle(
                                            color: AppColors.boldHeadlineColor,
                                            fontWeight: FontWeight.w500)),
                                    InkWell(
                                      onTap: () => Navigator.of(context).push(
                                          MaterialPageRoute(
                                              builder: (context) =>
                                                  LoginPage())),
                                      child: Text(
                                        "Login",
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
                      SizedBox(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(height: 8),
                            Text("Please confirm your email address.",
                                style: TextStyle(
                                    fontSize: 20, fontWeight: FontWeight.bold)),
                            SizedBox(height: 8),
                            Text(
                                "An email with confirmation instructions has been sent to:",
                                style: TextStyle(
                                    fontSize: 15, fontWeight: FontWeight.w500)),
                            FormFieldWidget(
                              prefixIcon: Container(
                                padding: const EdgeInsets.all(13.5),
                                child: SvgPicture.asset(
                                  "assets/icons/email-icon.svg",
                                  height: 10,
                                ),
                              ),
                              hintText: emailController.text,
                              enabled: false,
                              controller: TextEditingController(),
                            ),
                            SizedBox(height: 32),
                            InkWell(
                              onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute(
                                      builder: (context) => LoginPage())),
                              child: Container(
                                height: 56,
                                decoration: BoxDecoration(
                                    color: AppColors.primaryColor,
                                    borderRadius: BorderRadius.circular(4)),
                                child: Center(
                                  child: Text(
                                    "Proceed to Login",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w500,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(height: 8),
                            Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text("Can't see the email?",
                                      style: TextStyle(
                                          color: AppColors.boldHeadlineColor,
                                          fontWeight: FontWeight.w500)),
                                  InkWell(
                                    onTap: () => Navigator.of(context).push(
                                        MaterialPageRoute(
                                            builder: (context) => LoginPage())),
                                    child: Text(
                                      "Resend",
                                      style: TextStyle(
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.primaryColor),
                                    ),
                                  )
                                ]),
                          ],
                        ),
                      ),
                      SizedBox(
                          child: Column(
                        children: [
                          Center(
                            child: SvgPicture.asset(
                                "assets/images/auth/location-permission.svg"),
                          ),
                          SizedBox(height: 32),
                          Text(
                            "Enable Locations",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                              "Allow AirQo to send you location air quality updates for the places you care about",
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 14)),
                          SizedBox(height: 32),
                          AirQoButton(
                            label: "Yes, enable locations",
                            textColor: Colors.white,
                            color: AppColors.primaryColor,
                            onPressed: () {},
                          ),
                          SizedBox(height: 16),
                          Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Text("No, Thanks",
                                    style: TextStyle(fontSize: 12)),
                                SizedBox(width: 4),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  size: 12,
                                )
                              ])
                        ],
                      )),
                      SizedBox(
                          child: Column(
                        children: [
                          Center(
                            child: SvgPicture.asset(
                                "assets/images/auth/notification.svg"),
                          ),
                          SizedBox(height: 32),
                          Text(
                            "Know Your Air In Real Time",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                              "Get notified when air quality is \n getting better or worse",
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 14)),
                          SizedBox(height: 32),
                          AirQoButton(
                            label: "Yes, keep me updated.",
                            textColor: Colors.white,
                            color: AppColors.primaryColor,
                            onPressed: () {},
                          ),
                          SizedBox(height: 16),
                          Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Text("No, Thanks",
                                    style: TextStyle(fontSize: 12)),
                                SizedBox(width: 4),
                                Icon(
                                  Icons.arrow_forward_ios,
                                  size: 12,
                                )
                              ])
                        ],
                      )),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ignore: must_be_immutable
class StepperWidget extends StatelessWidget {
  final int currentIndex;
  final int count;
  bool? green;
  StepperWidget(
      {super.key,
      this.green = false,
      required this.currentIndex,
      required this.count});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      scrollDirection: Axis.horizontal,
      itemCount: count,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            color: currentIndex >= index
                ? green!
                    ? Color(0xff57D175)
                    : AppColors.primaryColor
                : Theme.of(context).highlightColor,
          ),
          height: 6,
          width: 34,
        );
      },
    );
  }
}
