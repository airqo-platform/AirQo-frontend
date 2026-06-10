import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class MapSearchErrorPage extends StatelessWidget {
  const MapSearchErrorPage({super.key});

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
              'assets/icons/location.svg',
              width: maxWidth * 0.5,
              height: maxWidth * 0.5,
            ),
            SizedBox(height: maxHeight * 0.05),
            TranslatedText(
              "No results found",
              style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                    fontSize: maxWidth * 0.06,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            SizedBox(height: maxHeight * 0.02),
            TranslatedText(
              "Please try again with a different location name",
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