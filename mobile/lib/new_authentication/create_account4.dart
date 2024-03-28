import 'package:app/new_authentication/widgets.dart';
import 'package:app/themes/colors.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class VerificationPage extends StatefulWidget {
  const VerificationPage({super.key});

  @override
  VerificationPageState createState() => VerificationPageState();
}

class VerificationPageState extends State<VerificationPage> {
  final _formKey = GlobalKey<FormState>();
  final pinController = TextEditingController();
  final focusNode = FocusNode();

  final _pageController = PageController();
  int _currentPage = 0;

  bool showError = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _pageController.dispose();
    pinController.dispose();
    focusNode.dispose();
    super.dispose();
  }

  void _updateIndicator() {
    setState(() {
      _currentPage = 0;
    });
    _pageController.animateToPage(
      _currentPage - 1,
      duration: const Duration(milliseconds: 500),
      curve: Curves.ease,
    );
  }

  Color _getIndicatorColor(int index) {
    if (index == _currentPage - 1) {
      return CustomColors.appColorBlue;
    } else {
      return Theme.of(context).unselectedWidgetColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    const length = 6;
    const focusedBorderColor = Color.fromRGBO(23, 171, 144, 1);
    const fillColor = Color.fromRGBO(243, 246, 249, 0.233);
    const borderColor = Color.fromRGBO(23, 171, 144, 0.4);
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: GoogleFonts.poppins(
        fontSize: 22,
        color: Colors.white,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor),
        color: fillColor,
      ),
    );

    return Scaffold(
      backgroundColor: const Color(0xff34373B),
      appBar: AppBar(
        backgroundColor: const Color(0xff34373B),
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
        titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
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
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const SizedBox(
                        height: 30,
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(
                            child: AutoSizeText(
                              'We just sent you an SMS',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.color,
                                fontFamily: 'Inter',
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            child: AutoSizeText(
                              'Enter the verification code sent to +256705 *** ***',
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              style: TextStyle(
                                color: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.color,
                                fontFamily: 'Inter',
                                fontSize: 16,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Form(
                            key: _formKey,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Directionality(
                                  textDirection: TextDirection.ltr,
                                  child: Pinput(
                                    length: length,
                                    controller: pinController,
                                    focusNode: focusNode,
                                    keyboardType: TextInputType.number,
                                    listenForMultipleSmsOnAndroid: true,
                                    defaultPinTheme: defaultPinTheme,
                                    androidSmsAutofillMethod:
                                        AndroidSmsAutofillMethod.none,
                                    senderPhoneNumber: '+1234567890',
                                    separatorBuilder: (index) =>
                                        const SizedBox(width: 8),
                                    validator: (value) {
                                      return value == '222222'
                                          ? null
                                          : 'Pin is incorrect';
                                    },
                                    onCompleted: (pin) {
                                      setState(
                                          () => showError = pin != '222222');
                                    },
                                    hapticFeedbackType:
                                        HapticFeedbackType.lightImpact,
                                    onChanged: (value) {
                                      debugPrint('onChanged: $value');
                                    },
                                    cursor: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Container(
                                          margin:
                                              const EdgeInsets.only(bottom: 9),
                                          width: 22,
                                          height: 1,
                                          color: focusedBorderColor,
                                        ),
                                      ],
                                    ),
                                    focusedPinTheme: defaultPinTheme.copyWith(
                                      decoration:
                                          defaultPinTheme.decoration!.copyWith(
                                        borderRadius: BorderRadius.circular(8),
                                        color: Colors.transparent,
                                        border: Border.all(
                                          color: focusedBorderColor,
                                        ),
                                      ),
                                    ),
                                    submittedPinTheme: defaultPinTheme.copyWith(
                                      decoration:
                                          defaultPinTheme.decoration!.copyWith(
                                        color: fillColor,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                            color: focusedBorderColor),
                                      ),
                                    ),
                                    errorPinTheme:
                                        defaultPinTheme.copyBorderWith(
                                      border:
                                          Border.all(color: Colors.redAccent),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                GestureDetector(
                                  onTap: _updateIndicator,
                                  child: const Text(
                                    "Didn't receive a code?",
                                    style: TextStyle(
                                      fontStyle: FontStyle.normal,
                                      decoration: TextDecoration.underline,
                                      decorationColor: Color(0xff145FFF),
                                      color: Color(0xff145FFF),
                                      fontFamily: 'Inter',
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 30),
                                NextButton(
                                  textColor: Colors.white,
                                  text: 'Continue',
                                  buttonColor: const Color(0xff145FFF),
                                  callBack: () {
                                    if (_formKey.currentState!.validate()) {
                                      _submitForm();

                                      // Navigate to the next page
                                      // Navigator.push(
                                      //   context,
                                      //   MaterialPageRoute(
                                      //     builder: (context) => const UserDetailsPage(),
                                      //   ),
                                      // );
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _submitForm() {
    // TODO Implement form submission logic here
  }
}
