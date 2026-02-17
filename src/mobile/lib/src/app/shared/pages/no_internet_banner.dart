import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/shared/bloc/connectivity_bloc.dart';

class NoInternetBanner extends StatelessWidget {
  final VoidCallback? onClose;

  const NoInternetBanner({Key? key, this.onClose}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ConnectivityBloc, ConnectivityState>(
      builder: (context, state) {
        if (state is! ConnectivityOffline || 
            (state).isDismissed) {
          return SizedBox.shrink();
        }

        return Container(
          color: Colors.red,
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Internet Connection Lost',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16.0,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.close, color: Colors.white),
                  onPressed: () {
                    context.read<ConnectivityBloc>().add(ConnectivityBannerDismissed());
                    onClose?.call();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}