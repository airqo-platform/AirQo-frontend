import 'package:app/other/lib/blocs/app/app_bloc.dart';
import 'package:app/other/lib/cubits/signup/signup_cubit.dart';
import 'package:app/other/lib/new_authentication/widgets.dart';
import 'package:app/other/lib/repositories/auth_repository.dart';
import 'package:app/other/lib/screens/home_screen.dart';
import 'package:app/themes/colors.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

import 'package:flutter_bloc/flutter_bloc.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider<SignupCubit>(
      create: (_) => SignupCubit(context.read<AuthRepository>()),
      child: const UserDetailsPage2(),
    );
  }
}

class UserDetailsPage2 extends StatefulWidget {
  const UserDetailsPage2({super.key});

  @override
  UserDetailsPage2State createState() => UserDetailsPage2State();
}

class UserDetailsPage2State extends State<UserDetailsPage2> {
  final _formKey = GlobalKey<FormState>();
  late PageController _pageController;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  int _currentPage = 0;
  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneNumberController.dispose();
    super.dispose();
  }

  Color _getIndicatorColor(int index) {
    return index == _currentPage - 1
        ? CustomColors.appColorBlue
        : Theme.of(context).unselectedWidgetColor;
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<SignupCubit, SignupState>(
      listener: (context, state) {
        if (state.status == SignupStatus.success) {
          print('Signup successfulYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) {
                return BlocProvider.value(
                  value: context.read<AppBloc>(),
                  child: const HomeScreen(),
                );
              },
            ),
          );
        }
        if (state.status == SignupStatus.error) {
          if (kDebugMode) {
            print(
                'signup failed: ${'Unknown errorhdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh'}');
          }
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              const SnackBar(
                content: Text(
                    'signup failed: ${'dddddddddddddddddddddddddddddddUnknown error'}'),
              ),
            );
        }
      },
      child: BlocBuilder<SignupCubit, SignupState>(
        builder: (context, state) {
          return Scaffold(
            backgroundColor: const Color(0xff34373B),
            appBar: AppBar(
              title: Column(
                children: [
                  Text(
                    'Create Account',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 5),
                  SmoothPageIndicator(
                    controller: _pageController,
                    count: 3,
                    effect: WormEffect(
                      dotWidth: 40,
                      dotHeight: 6,
                      activeDotColor: _getIndicatorColor(0),
                      dotColor: _getIndicatorColor(1),
                    ),
                  ),
                ],
              ),
              centerTitle: true,
              leading: IconButton(
                icon: Icon(
                  Icons.arrow_back,
                  color: Theme.of(context).textTheme.bodyLarge?.color,
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ),
            body: BlocBuilder<SignupCubit, SignupState>(
              builder: (context, state) {
                return PageView(
                  controller: _pageController,
                  children: [
                    SingleChildScrollView(
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 20),
                              child: EmailEditFieldSignup(
                                focusedBorderColor:
                                    Theme.of(context).focusColor,
                                fillColor: Theme.of(context)
                                    .inputDecorationTheme
                                    .focusColor,
                                hintText: 'Enter your email',
                                valueChange: (value) {},
                                label: 'Email',
                                controller: _emailController,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 20),
                              child: PhoneNumberEditField(
                                label: 'Phone Number',
                                hintText: 'Enter your phone number',
                                valueChange: (value) {},
                                focusedBorderColor:
                                    Theme.of(context).focusColor,
                                fillColor: Theme.of(context)
                                    .inputDecorationTheme
                                    .focusColor,
                                controller: _phoneNumberController,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 20),
                              child: PasswordEditFieldSignup(
                                focusedBorderColor:
                                    Theme.of(context).focusColor,
                                fillColor: Theme.of(context)
                                    .inputDecorationTheme
                                    .focusColor,
                                label: 'Password',
                                hintText: 'Enter your password',
                                valueChange: (value) {},
                                controller: _passwordController,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 20),
                              child: NextButtonSignup(
                                textColor: Colors.white,
                                text: 'Continue',
                                buttonColor: const Color(0xff145FFF),
                                callBack: () {
                                  if (_formKey.currentState!.validate()) {
                                    final signupCubit =
                                        BlocProvider.of<SignupCubit>(context);
                                    if (_formKey.currentState!.validate()) {
                                      signupCubit.signupFormSubmitted();
                                    }

                                    // Navigate to the next page if needed
                                    if (_currentPage < 2) {
                                      _pageController.nextPage(
                                        duration:
                                            const Duration(milliseconds: 300),
                                        curve: Curves.easeInOut,
                                      );
                                      setState(() {
                                        _currentPage++;
                                      });
                                    } else {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              const HomeScreen(),
                                        ),
                                      );
                                    }
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }
}
