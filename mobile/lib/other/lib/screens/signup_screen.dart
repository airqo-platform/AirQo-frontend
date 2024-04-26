// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';

// import '/cubits/cubits.dart';
// import '/repositories/repositories.dart';

// class SignupScreen extends StatelessWidget {
//   const SignupScreen({super.key});

//   static Route route() {
//     return MaterialPageRoute<void>(builder: (_) => const SignupScreen());
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: const Text('Signup')),
//       body: Padding(
//         padding: const EdgeInsets.all(20.0),
//         child: BlocProvider<SignupCubit>(
//           create: (_) => SignupCubit(context.read<AuthRepository>()),
//           child: const SignupForm(),
//         ),
//       ),
//     );
//   }
// }

// class SignupForm extends StatelessWidget {
//   const SignupForm({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return BlocListener<SignupCubit, SignupState>(
//       listener: (context, state) {
//         if (state.status == SignupStatus.success) {
//           Navigator.of(context).pop();
//         } else if (state.status == SignupStatus.error) {
//           // Nothing for now.
//         }
//       },
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           _EmailInput(),
//           const SizedBox(height: 8),
//           _PasswordInput(),
//           const SizedBox(height: 8),
//           _SignupButton(),
//         ],
//       ),
//     );
//   }
// }

// class _EmailInput extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<SignupCubit, SignupState>(
//       buildWhen: (previous, current) => previous.email != current.email,
//       builder: (context, state) {
//         return TextField(
//           onChanged: (email) {
//             context.read<SignupCubit>().emailChanged(email);
//           },
//           decoration: const InputDecoration(labelText: 'email'),
//         );
//       },
//     );
//   }
// }

// class _PasswordInput extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<SignupCubit, SignupState>(
//       buildWhen: (previous, current) => previous.password != current.password,
//       builder: (context, state) {
//         return TextField(
//           onChanged: (password) {
//             context.read<SignupCubit>().passwordChanged(password);
//           },
//           decoration: const InputDecoration(labelText: 'password'),
//           obscureText: true,
//         );
//       },
//     );
//   }
// }

// class _SignupButton extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<SignupCubit, SignupState>(
//       buildWhen: (previous, current) => previous.status != current.status,
//       builder: (context, state) {
//         return state.status == SignupStatus.submitting
//             ? const CircularProgressIndicator()
//             : ElevatedButton(
//                 style: ElevatedButton.styleFrom(
//                   foregroundColor: Colors.blue,
//                   fixedSize: const Size(200, 40),
//                 ),
//                 onPressed: () {
//                   context.read<SignupCubit>().signupFormSubmitted();
//                 },
//                 child: const Text(
//                   'SIGN UP',
//                   style: TextStyle(color: Colors.white),
//                 ),
//               );
//       },
//     );
//   }
// }
