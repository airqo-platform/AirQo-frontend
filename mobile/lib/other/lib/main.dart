// import 'package:app/other/lib/blocs/app/app_bloc.dart';
// import 'package:app/other/lib/cubits/login/login_cubit.dart';
// import 'package:app/other/lib/cubits/signup/signup_cubit.dart';
// import 'package:app/other/lib/repositories/auth_repository.dart';
// import 'package:firebase_core/firebase_core.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_bloc/flutter_bloc.dart';


// void main() async {
//   WidgetsFlutterBinding.ensureInitialized();
//   await Firebase.initializeApp();

//   final authRepository = AuthRepository();

//   runApp(App(authRepository: authRepository));
// }

// class App extends StatelessWidget {
//   final AuthRepository authRepository;

//   const App({super.key, required this.authRepository});

//   @override
//   Widget build(BuildContext context) {
//     return RepositoryProvider.value(
//       value: authRepository,
//       child: MultiBlocProvider(
//         providers: [
//           BlocProvider<AppBloc>(
//             create: (_) => AppBloc(authRepository: authRepository),
//           ),
//           BlocProvider<LoginCubit>(
//             create: (_) => LoginCubit(authRepository),
//           ),
//           BlocProvider<SignupCubit>(
//             create: (_) => SignupCubit(authRepository),
//           ),
//         ],
//         child: const MaterialApp(
//           home: AppView(),
//         ),
//       ),
//     );
//   }
// }

// class AppView extends StatelessWidget {
//   const AppView({
//     super.key,
//   });

//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'App',
//       theme: ThemeData(
//         primarySwatch: Colors.blue,
//       ),
//       // onGenerateRoute: onGenerateRoute,
//     );
//   }
// }
