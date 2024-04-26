import 'package:app/other/lib/blocs/app/app_bloc.dart';
import 'package:app/other/lib/blocs/app/app_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AppBloc, AppState>(
      builder: (context, state) {
        if (state.status == AppStatus.authenticated) {
          final user = state.user;
          return Scaffold(
            appBar: AppBar(
              title: const Text('Home'),
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (user.email != null)
                    Text(
                      'Email: ${user.email}',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  const SizedBox(height: 16.0),
                  ElevatedButton(
                    onPressed: () {
                      context.read<AppBloc>().add(AppLogoutRequested());
                    },
                    child: const Text('Logout'),
                  ),
                ],
              ),
            ),
          );
        } else {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }
      },
    );
  }
}
