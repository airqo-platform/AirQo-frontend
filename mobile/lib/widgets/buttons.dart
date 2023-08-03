import 'package:app/themes/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../screens/home_page.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class NextButton extends StatelessWidget {
  const NextButton({
    super.key,
    required this.buttonColor,
    required this.callBack,
    this.text,
    this.showIcon = true,
  });
  final String? text;
  final bool showIcon;
  final Color buttonColor;
  final Function callBack;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () {
          callBack();
        },
        style: OutlinedButton.styleFrom(
          elevation: 0,
          side: const BorderSide(
            color: Colors.transparent,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(8),
            ),
          ),
          backgroundColor: buttonColor,
          foregroundColor: buttonColor,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              text ?? AppLocalizations.of(context)!.next, 
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                letterSpacing: 16 * -0.022,
              ),
            ),
            Visibility(
              visible: showIcon,
              child: Padding(
                padding: const EdgeInsets.only(left: 11),
                child: SvgPicture.asset(
                  'assets/icon/next_arrow.svg',
                  semanticsLabel: 'Share',
                  height: 17.42,
                  width: 10.9,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> popNavigation(BuildContext context) async {
  if (Navigator.canPop(context)) {
    Navigator.pop(context);
  } else {
    await Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) {
        return const HomePage();
      }),
      (r) => false,
    );
  }
}

class AppBackButton extends StatelessWidget {
  const AppBackButton({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        FocusScope.of(context).requestFocus(FocusNode());
        await popNavigation(context);
      },
      child: SvgPicture.asset(
        'assets/icon/back_button.svg',
        semanticsLabel: 'more',
        height: 40,
        width: 40,
      ),
    );
  }
}

class IconTextButton extends StatelessWidget {
  const IconTextButton({
    super.key,
    required this.iconWidget,
    required this.text,
  });
  final Widget iconWidget;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        iconWidget,
        const SizedBox(
          width: 10,
        ),
        Text(
          text,
          style: TextStyle(
            fontSize: 14,
            color: CustomColors.appColorBlack,
            height: 18 / 14,
          ),
        ),
      ],
    );
  }
}

class TabButton extends StatelessWidget {
  const TabButton({
    super.key,
    required this.text,
    required this.index,
    required this.tabController,
  });
  final String text;
  final int index;
  final TabController? tabController;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(
        minWidth: double.infinity,
        maxHeight: 32,
      ),
      decoration: BoxDecoration(
        color: tabController?.index == index
            ? CustomColors.appColorBlue
            : Colors.white,
        borderRadius: const BorderRadius.all(
          Radius.circular(4.0),
        ),
      ),
      child: Tab(
        child: Text(
          text,
          style: CustomTextStyle.button1(context)?.copyWith(
            color: tabController?.index == index
                ? Colors.white
                : CustomColors.appColorBlue,
          ),
        ),
      ),
    );
  }
}

class ActionButton extends StatelessWidget {
  const ActionButton({
    super.key,
    required this.icon,
    required this.text,
  });
  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: 197,
      decoration: BoxDecoration(
        color: CustomColors.appColorBlue,
        borderRadius: const BorderRadius.all(
          Radius.circular(8.0),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              letterSpacing: 16 * -0.022,
            ),
          ),
          const SizedBox(
            width: 6,
          ),
          Icon(
            icon,
            color: Colors.white,
            size: 21,
          ),
        ],
      ),
    );
  }
}
