
// import 'package:app/other/lib/cubits/login/login_cubit.dart';
// import 'package:app/other/lib/new_authentication/widgets.dart';
// import 'package:app/other/lib/repositories/auth_repository.dart';
// import 'package:app/other/lib/screens/home_screen.dart';
// import 'package:app/other/lib/screens/new_signup.dart';
// import 'package:app/themes/colors.dart';
// import 'package:flutter/foundation.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter/widgets.dart';
// import 'package:smooth_page_indicator/smooth_page_indicator.dart';

// import 'package:flutter_bloc/flutter_bloc.dart';


// class LoginScreen extends StatelessWidget {
//   const LoginScreen({super.key});


//   @override
//   Widget build(BuildContext context) {
//     return BlocProvider(
//       create: (_) => LoginCubit(context.read<AuthRepository>()),
//       child: const LoginPage(),
//     );
//   }
// }

// class LoginPage extends StatefulWidget {
//   const LoginPage({super.key});

//   @override
//   LoginPageState createState() => LoginPageState();
// }

// class LoginPageState extends State<LoginPage> {
//   final _formKey = GlobalKey<FormState>();
//   final _firstNameController = TextEditingController();
//   final _lastNameController = TextEditingController();
//   final _emailController = TextEditingController();
//   final _passwordController = TextEditingController();
//   final _pageController = PageController();
//   int _currentPage = 0;
//   late LoginCubit _loginCubit;

//   @override
//   void initState() {
//     super.initState();
//     _firstNameController.addListener(_updateIndicator);
//     _lastNameController.addListener(_updateIndicator);
//     _loginCubit = context.read<LoginCubit>(); // Initialize _loginCubit
//   }

//   @override
//   void dispose() {
//     _firstNameController.removeListener(_updateIndicator);
//     _lastNameController.removeListener(_updateIndicator);
//     _firstNameController.dispose();
//     _lastNameController.dispose();
//     _pageController.dispose();
//     super.dispose();
//   }

//   void _updateIndicator() {
//     setState(() {
//       _currentPage = 0;
//       if (_firstNameController.text.isNotEmpty) {
//         _currentPage = 1;
//       }
//       if (_lastNameController.text.isNotEmpty) {
//         _currentPage = 2;
//       }
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
//     _loginCubit = context.read<LoginCubit>(); // Initialize _loginCubit
//     return BlocListener<LoginCubit, LoginState>(
//       listener: (context, state) {
//         if (state.status == LoginStatus.success) {
//           print('Login successfulYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY');
//           Navigator.push(
//             context,
//             MaterialPageRoute(
//               builder: (context) => const HomeScreen(),
//             ),
//           );
//         }
//         if (state.status == LoginStatus.error) {
//           if (kDebugMode) {
//             print(
//                 'Login failed: ${'Unknown errorhdhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh'}');
//           }
//           ScaffoldMessenger.of(context)
//             ..hideCurrentSnackBar()
//             ..showSnackBar(
//               SnackBar(
//                 content: Text(
//                     'Login failed: ${'dddddddddddddddddddddddddddddddUnknown error'}'),
//               ),
//             );
//         }
//       },
//       child: BlocBuilder<LoginCubit, LoginState>(
//         builder: (context, state) {
//           return Scaffold(
//             backgroundColor: const Color(0xff34373B),
//             appBar: AppBar(
//               title: Column(
//                 children: [
//                   Text(
//                     'Login',
//                     style: Theme.of(context).textTheme.titleMedium,
//                   ),
//                   const SizedBox(height: 5),
//                   SmoothPageIndicator(
//                     controller: _pageController,
//                     count: 3,
//                     effect: WormEffect(
//                       dotWidth: 40,
//                       dotHeight: 6,
//                       activeDotColor: _getIndicatorColor(0),
//                       dotColor: _getIndicatorColor(1),
//                     ),
//                   ),
//                 ],
//               ),
//               centerTitle: true,
//               titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
//               leading: IconButton(
//                 icon: Icon(
//                   Icons.arrow_back,
//                   color: Theme.of(context).textTheme.bodyLarge?.color,
//                 ),
//                 onPressed: () {
//                   Navigator.pop(context);
//                 },
//               ),
//             ),
//             body: SingleChildScrollView(
//               child: Form(
//                 key: _formKey,
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Padding(
//                       padding: const EdgeInsets.symmetric(horizontal: 20),
//                       child: EmailEditFieldLogin(
//                         focusedBorderColor: Theme.of(context).focusColor,
//                         fillColor:
//                             Theme.of(context).inputDecorationTheme.focusColor,
//                         hintText: 'Enter your email',
//                         valueChange: (value) {},
//                         label: 'Email',
//                         controller: _emailController,
//                       ),
//                     ),
//                     const SizedBox(height: 20),
//                     Padding(
//                       padding: const EdgeInsets.symmetric(horizontal: 20),
//                       child: PasswordEditFieldLogin(
//                         focusedBorderColor: Theme.of(context).focusColor,
//                         fillColor:
//                             Theme.of(context).inputDecorationTheme.focusColor,
//                         label: 'Password',
//                         hintText: 'Enter your password',
//                         valueChange: (value) {},
//                         controller: _passwordController,
//                       ),
//                     ),
//                     const SizedBox(height: 20),
//                     Padding(
//                       padding: const EdgeInsets.symmetric(horizontal: 20),
//                       child: NextButtonLogin(
//                         textColor: Colors.white,
//                         text: 'Login',
//                         buttonColor: const Color(0xff145FFF),
//                         callBack: () {
//                           _submitForm();
//                         },
//                       ),
//                     ),
//                     SizedBox(
//                       width: double.infinity,
//                       child: Row(
//                         crossAxisAlignment: CrossAxisAlignment.center,
//                         mainAxisAlignment: MainAxisAlignment.center,
//                         children: [
//                           Text(
//                             "Don't have an account?",
//                             textAlign: TextAlign.center,
//                             style:
//                                 Theme.of(context).textTheme.bodySmall?.copyWith(
//                                       color: CustomColors.appBodyColor
//                                           .withOpacity(0.6),
//                                     ),
//                           ),
//                           GestureDetector(
//                             onTap: () {
//                               //navigate to the signup page
//                               Navigator.push(
//                                 context,
//                                 MaterialPageRoute(
//                                   builder: (context) => const SignupScreen(),
//                                 ),
//                               );
//                             },
//                             child: Text(
//                               'Create an account',
//                               textAlign: TextAlign.center,
//                               style: Theme.of(context)
//                                   .textTheme
//                                   .bodySmall
//                                   ?.copyWith(
//                                     color: CustomColors.appColorBlue
//                                         .withOpacity(0.6),
//                                   ),
//                             ),
//                           ),
//                         ],
//                       ),
//                     )
//                   ],
//                 ),
//               ),
//             ),
//           );
//         },
//       ),
//     );
//   }

//   void _submitForm() {
//     if (_formKey.currentState!.validate()) {
//       try {
//         _loginCubit.logInWithCredentials();
//         print('Login successful');
//       } catch (e) {
//         print('Login failed: $e');
//         ScaffoldMessenger.of(context)
//           ..hideCurrentSnackBar()
//           ..showSnackBar(
//             SnackBar(
//               content: Text('Login failed: $e'),
//             ),
//           );
//       }
//     }
//   }
// }

// class ProceedAsGuest extends StatelessWidget {
//   const ProceedAsGuest({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return InkWell(
//       onTap: () async {
//         await _guestSignIn(context);
//       },
//       child: SizedBox(
//         width: double.infinity,
//         child: Row(
//           crossAxisAlignment: CrossAxisAlignment.center,
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Text(
//               'Continue As Guest',
//               textAlign: TextAlign.center,
//               style: Theme.of(context).textTheme.bodySmall?.copyWith(
//                     color: CustomColors.appBodyColor.withOpacity(0.6),
//                   ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }

//   Future<void> _guestSignIn(BuildContext context) async {
//     // TODO Implement guest sign in logic here
//   }
// }
