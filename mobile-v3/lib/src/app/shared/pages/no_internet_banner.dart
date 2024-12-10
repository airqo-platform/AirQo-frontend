import 'package:flutter/material.dart';

class NoInternetBanner extends StatelessWidget {
  final VoidCallback onClose;

  const NoInternetBanner({Key? key, required this.onClose}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.red,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Internet Connection Lost',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16.0,
            ),
          ),
          IconButton(
            icon: Icon(Icons.close, color: Colors.white),
            onPressed: onClose,
          ),
        ],
      ),
    );
  }
}
