import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ErrorPage extends StatelessWidget {
  const ErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SvgPicture.asset('assets/icons/error_occured.svg'),
        SizedBox(height: 16),
        Text("An Error Occured",
            style: Theme.of(context)
                .textTheme
                .headlineLarge!
                .copyWith(fontSize: 22)),
        SizedBox(height: 8),
        Text(
            "We’re having issues with our network \n no worries, we’ll be back up soon.",
            textAlign: TextAlign.center,
            style: TextStyle())
      ],
    );
  }
}
