import 'package:app/services/native_api.dart';
import 'package:flutter/material.dart';
import 'package:rating_dialog/rating_dialog.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../screens/dashboard/dashboard_view.dart';
import '../screens/feedback/feedback_page.dart';

class Rating extends StatefulWidget {
  const Rating({Key? key}) : super(key: key);

  @override
  State<Rating> createState() => _RatingState();
}

class _RatingState extends State<Rating> {
  late SharedPreferences _prefs;
  int appOpenCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _prefs = await SharedPreferences.getInstance();
      appOpenCount = _prefs.getInt('appOpenCount') ?? 0;
      appOpenCount++;

      if (appOpenCount == 3) {
        // ignore: use_build_context_synchronously
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return Builder(
              builder: (BuildContext context) {
                return RatingDialog(
                  initialRating: 1.0,
                  title: const Text(
                    'Rating Dialog',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  message: const Text(
                    'Tap a star to set your rating. ',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 15),
                  ),
                  image: const FlutterLogo(size: 100),
                  submitButtonText: 'Submit',
                  commentHint: 'Set your custom comment hint',
                  onCancelled: () => print('cancelled'),
                  onSubmitted: (response) {
                    print(
                        'rating: ${response.rating}, comment: ${response.comment}');

                    if (response.rating < 3.0) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const FeedbackPage()),
                      );
                    } else {
                      RateService.rateApp();
                    }
                  },
                );
              },
            );
          },
        );
      }

      await _prefs.setInt('appOpenCount', appOpenCount);
    });
  }

  @override
  Widget build(BuildContext context) {
    // return FutureBuilder<List<FavouritePlace>>(
    // future: fetchFavouritePlaces(),
    //builder: (context, snapshot) {
    return const DashboardView();
  } //,
//);
//}
}
