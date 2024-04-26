// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';

// import '/cubits/cubits.dart';
// import '/repositories/repositories.dart';
// import '/screens/screens.dart';

// class LoginScreen extends StatelessWidget {
//   const LoginScreen({super.key});

//   static Page page() => const MaterialPage<void>(child: LoginScreen());

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: const Text('Login')),
//       body: Padding(
//         padding: const EdgeInsets.all(20.0),
//         child: BlocProvider(
//           create: (_) => LoginCubit(context.read<AuthRepository>()),
//           child: const LoginForm(),
//         ),
//       ),
//     );
//   }
// }

// class LoginForm extends StatelessWidget {
//   const LoginForm({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return BlocListener<LoginCubit, LoginState>(
//       listener: (context, state) {
//         if (state.status == LoginStatus.error) {}
//       },
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           _EmailInput(),
//           const SizedBox(height: 8),
//           _PasswordInput(),
//           const SizedBox(height: 8),
//           _LoginButton(),
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
//     return BlocBuilder<LoginCubit, LoginState>(
//       buildWhen: (previous, current) => previous.email != current.email,
//       builder: (context, state) {
//         return TextField(
//           onChanged: (email) {
//             context.read<LoginCubit>().emailChanged(email);
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
//     return BlocBuilder<LoginCubit, LoginState>(
//       buildWhen: (previous, current) => previous.password != current.password,
//       builder: (context, state) {
//         return TextField(
//           onChanged: (password) {
//             context.read<LoginCubit>().passwordChanged(password);
//           },
//           decoration: const InputDecoration(labelText: 'password'),
//           obscureText: true,
//         );
//       },
//     );
//   }
// }

// class _LoginButton extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return BlocBuilder<LoginCubit, LoginState>(
//       buildWhen: (previous, current) => previous.status != current.status,
//       builder: (context, state) {
//         return state.status == LoginStatus.submitting
//             ? const CircularProgressIndicator()
//             : ElevatedButton(
//                 style: ElevatedButton.styleFrom(
//                   fixedSize: const Size(200, 40),
//                 ),
//                 onPressed: () {
//                   context.read<LoginCubit>().logInWithCredentials();
//                 },
//                 child: const Text('LOGIN'),
//               );
//       },
//     );
//   }
// }

// class _SignupButton extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return ElevatedButton(
//       style: ElevatedButton.styleFrom(
//         foregroundColor: Colors.white,
//         fixedSize: const Size(200, 40),
//       ),
//       onPressed: () => Navigator.of(context).push<void>(SignupScreen.route()),
//       child: const Text(
//         'CREATE ACCOUNT',
//         style: TextStyle(color: Colors.blue),
//       ),
//     );
//   }
// }
