import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Should not rate for new users', () {
    bool showRating = Profile.initialize().requiresRating();
    expect(showRating, false);
  });

  test('Should have next rating as 180 from the last rating date', () {
    DateTime lastRated = DateTime.now().subtract(const Duration(days: 190));

    Profile profile = Profile.initialize().copyWith(lastRated: lastRated);

    expect(
      profile.nextRatingDate.getDate(),
      lastRated.add(const Duration(days: 180)).getDate(),
    );
  });

  test('Should not rate if last rated was the current date, 180 days ago', () {
    Profile profile = Profile.initialize().copyWith(
        lastRated: DateTime.now().subtract(const Duration(days: 180)));
    bool showRating = profile.requiresRating();
    expect(showRating, false);
  });

  test('Should not rate if last rated was more than 180 days ago', () {
    Profile profile = Profile.initialize().copyWith(
        lastRated: DateTime.now().subtract(const Duration(days: 190)));
    bool showRating = profile.requiresRating();
    expect(showRating, true);
  });
}
