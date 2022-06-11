import 'package:app/screens/search/search_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

import '../../themes/colors.dart';

class EmptyFavouritePlaces extends StatelessWidget {
  const EmptyFavouritePlaces({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: CustomColors.appBodyColor,
      padding: const EdgeInsets.all(40.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(children: [
              TextSpan(
                text: 'Tap the ',
                style: Theme.of(context).textTheme.bodyText1,
              ),
              WidgetSpan(
                child: SvgPicture.asset(
                  'assets/icon/heart.svg',
                  semanticsLabel: 'Favorite',
                  height: 15.33,
                  width: 15.12,
                ),
              ),
              TextSpan(
                text: ' Favorite icon on any location air quality '
                    'to save them here for later.',
                style: Theme.of(context).textTheme.bodyText1,
              ),
            ]),
          ),
          const SizedBox(
            height: 10,
          ),
          OutlinedButton(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) {
                    return const SearchPage();
                  },
                ),
              );
            },
            style: OutlinedButton.styleFrom(
              shape: const CircleBorder(),
              padding: const EdgeInsets.all(24),
            ),
            child: Text(
              'Add',
              style: TextStyle(color: CustomColors.appColor),
            ),
          ),
        ],
      ),
    );
  }
}
