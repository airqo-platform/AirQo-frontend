import 'package:airqo/src/app/auth/pages/login_page.dart';
import 'package:airqo/src/app/auth/pages/register_page.dart';
import 'package:airqo/src/app/auth/widgets/breathe_clean.dart';
import 'package:airqo/src/app/auth/widgets/know_your_air.dart';
import 'package:airqo/src/app/auth/widgets/welcome_widget.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  PageController? controller;
  int currentIndex = 0;

  @override
  void initState() {
    controller = new PageController();
    super.initState();
  }

  void changeIndex(int index) {
    setState(() {
      currentIndex = index;
    });
  }

  @override
  void dispose() {
    controller!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(
      children: [
        Stack(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.6,
              child: PageView(
                controller: controller,
                onPageChanged: changeIndex,
                children: [
                  WelcomeWidget(),
                  BreatheClean(),
                  KnowYourAir(),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.6,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  AnimatedSmoothIndicator(
                    activeIndex: currentIndex,
                    count: 3,
                    effect: ExpandingDotsEffect(
                        dotWidth: 7,
                        radius: 7,
                        dotColor: Color(0xff60646C),
                        // activeDotColor: Color(0xffF6F6F7),
                        activeDotColor: AppColors.primaryColor,
                        dotHeight: 7),
                  ),
                  SizedBox(height: 16)
                ],
              ),
            ),
          ],
        ),
        SizedBox(
            height: MediaQuery.of(context).size.height * 0.4,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16 * 2),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                        builder: (context) => CreateAccountScreen())),
                    child: Container(
                      height: 56,
                      decoration: BoxDecoration(
                          color: AppColors.primaryColor,
                          borderRadius: BorderRadius.circular(4)),
                      child: Center(
                        child: Text(
                          "Create Account",
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                  InkWell(
                    onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => LoginPage())),
                    child: Container(
                      height: 56,
                      decoration: BoxDecoration(
                          color: Theme.of(context).brightness == Brightness.dark
                              ? Colors.white
                              : Theme.of(context).highlightColor,
                          borderRadius: BorderRadius.circular(4)),
                      child: Center(
                        child: Text(
                          "Login Here",
                          style: TextStyle(
                              fontWeight: FontWeight.w500, color: Colors.black),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                  SizedBox(height: 16),
                  Center(
                    child: InkWell(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(

                          builder: (context) => ForgotPasswordPage())),
                      child: Text("Forgot password?",
                          style: TextStyle(
                              color: AppColors.primaryColor,
                              fontWeight: FontWeight.w500)),
                    ),
                  ),

                ],
              ),
            ))
      ],
    ));
  }
}
