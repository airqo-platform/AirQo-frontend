// import 'package:authenticationtest/new_authentication/colors.dart';
// import 'package:authenticationtest/new_authentication/widgets.dart';
// import 'package:flutter/material.dart';
// import 'package:smooth_page_indicator/smooth_page_indicator.dart';

// class UserDetailsPage2 extends StatefulWidget {
//   const UserDetailsPage2({super.key});

//   @override
//   UserDetailsPage2State createState() => UserDetailsPage2State();
// }

// class UserDetailsPage2State extends State<UserDetailsPage2> {
//   final _formKey = GlobalKey<FormState>();

//   final _pageController = PageController();
//   final _emailController = TextEditingController();
//   final _passwordController = TextEditingController();
//   final _phoneNumberController = TextEditingController();
//   int _currentPage = 0;

//   @override
//   void initState() {
//     super.initState();
//   }

//   @override
//   void dispose() {
//     _pageController.dispose();
//     _emailController.dispose();
//     _passwordController.dispose();
//     _phoneNumberController.dispose();
//     super.dispose();
//   }

//   void _updateIndicator() {
//     setState(() {
//       _currentPage = 0;
//     });
//     _pageController.animateToPage(
//       _currentPage - 1,
//       duration: const Duration(milliseconds: 500),
//       curve: Curves.ease,
//     );
//   }

//   Color _getIndicatorColor(int index) {
//     if (index == _currentPage - 1) {
//       return CustomColors.appColorBlue;
//     } else {
//       return Theme.of(context).unselectedWidgetColor;
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: const Color(0xff34373B),
//       appBar: AppBar(
//         title: Column(
//           children: [
//             Text(
//               'Create Account',
//               style: Theme.of(context).textTheme.titleMedium,
//             ),
//             const SizedBox(height: 5),
//             SmoothPageIndicator(
//               controller: _pageController,
//               count: 3,
//               effect: WormEffect(
//                 dotWidth: 40,
//                 dotHeight: 6,
//                 activeDotColor: _getIndicatorColor(0),
//                 dotColor: _getIndicatorColor(1),
//               ),
//             ),
//           ],
//         ),
//         centerTitle: true,
//         titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
//         leading: IconButton(
//           icon: Icon(
//             Icons.arrow_back,
//             color: Theme.of(context).textTheme.bodyLarge?.color,
//           ),
//           onPressed: () {
//             Navigator.pop(context);
//           },
//         ),
//       ),
//       body: SingleChildScrollView(
//         child: Form(
//           key: _formKey,
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 20),
//                 child: EmailEditFieldLogin(
//                   focusedBorderColor: Theme.of(context).focusColor,
//                   fillColor: Theme.of(context).inputDecorationTheme.focusColor,
//                   hintText: 'Enter your email',
//                   valueChange: (value) {},
//                   label: 'Email',
//                   controller: _emailController,
//                 ),
//               ),
//               const SizedBox(height: 20),
//               Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 20),
//                 child: PhoneNumberEditField(
//                   label: 'Phone Number',
//                   hintText: 'Enter your phone number',
//                   valueChange: (value) {},
//                   focusedBorderColor: Theme.of(context).focusColor,
//                   fillColor: Theme.of(context).inputDecorationTheme.focusColor,
//                   controller: _phoneNumberController,
//                 ),
//               ),
//               const SizedBox(height: 20),
//               Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 20),
//                 child: PasswordEditFieldLogin(
//                   focusedBorderColor: Theme.of(context).focusColor,
//                   fillColor: Theme.of(context).inputDecorationTheme.focusColor,
//                   label: 'Password',
//                   hintText: 'Enter your password',
//                   valueChange: (value) {},
//                   controller: _passwordController,
//                 ),
//               ),
//               const SizedBox(height: 20),
//               Padding(
//                 padding: const EdgeInsets.symmetric(horizontal: 20),
//                 child: NextButtonLogin(
//                   textColor: Colors.white,
//                   text: 'Continue',
//                   buttonColor: const Color(0xff145FFF),
//                   callBack: () {
//                     if (_formKey.currentState!.validate()) {
//                       _submitForm();

//                       // Navigate to the next page
//                       // Navigator.push(
//                       //   context,
//                       //   MaterialPageRoute(
//                       //     builder: (context) => const UserDetailsPage(),
//                       //   ),
//                       // );
//                     }
//                   },
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   void _submitForm() {
//     // TODO Implement form submission logic here
//   }
// }
