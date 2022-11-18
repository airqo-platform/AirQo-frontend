import 'package:app/themes/theme.dart';
import 'package:app/widgets/buttons.dart';
import 'package:app/widgets/custom_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../home_page.dart';

class ErrorPage extends StatelessWidget {
  const ErrorPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppSafeArea(
      horizontalPadding: 24,
      verticalPadding: 24,
      widget: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Spacer(),
          SvgPicture.asset(
            'assets/icon/error_icon.svg',
            semanticsLabel: 'Error',
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 13),
            child: RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                children: <TextSpan>[
                  TextSpan(
                    text: 'Oops! ',
                    style: CustomTextStyle.headline7(context)?.copyWith(
                      color: CustomColors.appColorBlue,
                    ),
                  ),
                  TextSpan(
                    text:
                        'We can’t seem to find the content you’re looking for.',
                    style: CustomTextStyle.headline7(context)?.copyWith(
                      color: CustomColors.appColorBlack,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Text(
              'Scared?, take a deep breath of clean air on us. Ready? Breathe In, Breathe out.',
              textAlign: TextAlign.center,
              style: CustomTextStyle.headline8(context)?.copyWith(
                color: CustomColors.appColorBlack,
                fontWeight: FontWeight.normal,
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const HomePage();
                  },
                ),
                (r) => false,
              );
            },
            child: NextButton(
              buttonColor: CustomColors.appColorBlue,
              text: 'Return home',
            ),
          ),
        ],
      ),
    );
  }
}
