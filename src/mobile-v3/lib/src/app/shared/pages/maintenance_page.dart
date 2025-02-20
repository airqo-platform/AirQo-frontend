import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class MaintenancePage extends StatelessWidget {
  const MaintenancePage({super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        double maxWidth = constraints.maxWidth;
        double maxHeight = constraints.maxHeight;

        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/icons/error_occured.svg',
              width: maxWidth * 0.5,
              height: maxWidth * 0.5,
            ),
            SizedBox(height: maxHeight * 0.05),
            Text(
              "The app is currently under maintenance",
              style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                    fontSize: maxWidth * 0.06,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: maxHeight * 0.02),
            Text(
              "We're having issues with our network\nno worries, we'll be back up soon.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: maxWidth * 0.04,
              ),
            ),
          ],
        );
      },
    );
  }
}