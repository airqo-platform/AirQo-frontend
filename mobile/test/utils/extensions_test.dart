import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/intl.dart';

class TestModel extends Equatable {
  const TestModel({
    required this.testDateTime,
    required this.testInt,
  });

  final int testInt;
  final DateTime testDateTime;

  @override
  List<Object?> get props => [testDateTime.day];
}

void main() {
  group('AppStoreVersion', () {
    test('store version should be greater than user version', () {
      const String userAppVersion = '1.0.0';

      AppStoreVersion appStoreVersion = AppStoreVersion.fromJson({
        'version': '1.0.1',
        'url': 'https://airqo.net',
      });
      expect(appStoreVersion.compareVersion(userAppVersion), 1);

      appStoreVersion = AppStoreVersion.fromJson({
        'version': '1.1.0',
        'url': 'https://airqo.net',
      });
      expect(appStoreVersion.compareVersion(userAppVersion), 1);

      appStoreVersion = AppStoreVersion.fromJson({
        'version': '2.0.0',
        'url': 'https://airqo.net',
      });
      expect(appStoreVersion.compareVersion(userAppVersion), 1);
    });

    test('store version should be lesser than user version', () {
      final AppStoreVersion appStoreVersion = AppStoreVersion.fromJson({
        'version': '1.0.0',
        'url': 'https://airqo.net',
      });

      String userAppVersion = '1.0.1';
      expect(appStoreVersion.compareVersion(userAppVersion), -1);

      userAppVersion = '1.1.0';
      expect(appStoreVersion.compareVersion(userAppVersion), -1);

      userAppVersion = '2.0.0';
      expect(appStoreVersion.compareVersion(userAppVersion), -1);
    });

    test('store version should be equal to user version', () {
      final AppStoreVersion appStoreVersion = AppStoreVersion.fromJson({
        'version': '1.0.0',
        'url': 'https://airqo.net',
      });

      const String userAppVersion = '1.0.0';
      expect(appStoreVersion.compareVersion(userAppVersion), 0);
    });
  });
  group('set', () {
    test('should add or update a set', () {
      Set<TestModel> testData = {};
      TestModel updatedData =
          TestModel(testDateTime: DateTime.now(), testInt: 2);

      testData.add(TestModel(testDateTime: DateTime.now(), testInt: 1));
      testData.addOrUpdate(updatedData);

      expect(testData.length, 1);
      expect(testData.first, updatedData);
      expect(testData.first.testInt, updatedData.testInt);
      expect(testData.first.testDateTime, updatedData.testDateTime);

      TestModel secondItem = TestModel(
          testDateTime: DateTime.now().add(const Duration(days: 1)),
          testInt: 3);
      testData.add(secondItem);

      expect(testData.length, 2);
      expect(testData.last, secondItem);
      expect(testData.last.testInt, secondItem.testInt);
      expect(testData.last.testDateTime, secondItem.testDateTime);
    });
  });
  group('DoubleExtension', () {
    const startValue = 0.0;
    const endValue = 5.0;

    test('returns true when subject is within the given range', () {
      expect(5.0.isWithin(startValue, endValue), isTrue);
    });

    test('returns false when subject is larger than maxRange', () {
      expect(12.0.isWithin(startValue, endValue), isFalse);
    });

    test('returns false when subject is smaller than minRange', () {
      expect(3.0.isWithin(startValue, endValue), isFalse);
    });
  });
  group('StringExtension', () {
    //TODO: Review with Noah
    test('getNames should return a list of two strings', () {
      expect('Noble The Great'.getNames(), equals(['Noble', 'The', 'Great']));
      expect('John Doe'.getNames(), equals(['John', 'Doe']));
      expect('Mary'.getNames(), equals(['Mary']));
      expect(''.getNames(), equals(['']));
    });

    test(
        'equalsIgnoreCase should return true if two strings are equal ignoring case',
        () {
      expect('Hello'.equalsIgnoreCase('hello'), isTrue);
      expect('World'.equalsIgnoreCase('WORLD'), isTrue);
      expect('Foo'.equalsIgnoreCase('Bar'), isFalse);
    });

    test(
        'isValidPhoneNumber should return true if the string is a valid phone number',
        () {
      expect("".isValidPhoneNumber(), isFalse);
      expect('abcdefgh'.isValidPhoneNumber(), isFalse);
      expect('123456'.isValidPhoneNumber(), isFalse);
      expect('+123456789a2'.isValidPhoneNumber(), isFalse);
      expect('12345678901'.isValidPhoneNumber(), isFalse);
      expect('+1234567890123456'.isValidPhoneNumber(), isFalse);
      expect('(123)456-7890'.isValidPhoneNumber(), isFalse);
      expect('+12345678901'.isValidPhoneNumber(), isTrue);
      expect('+256772123459'.isValidPhoneNumber(), isTrue);
    });

    test(
        'isValidEmail should return true if the string is a valid email address',
        () {
      expect(''.isValidEmail(), isFalse);
      expect('noblethegreat'.isValidEmail(), isFalse);
      expect('.@example.com'.isValidEmail(), isFalse);
      expect('@example.com'.isValidEmail(), isFalse);
      expect('john.doe@example.'.isValidEmail(), isFalse);
      expect('noble@airqo.u'.isValidEmail(), isFalse);
      expect('noble@airqo.ug'.isValidEmail(), isTrue);
      expect('noble.m@airqo.net'.isValidEmail(), isTrue);
      expect('noble.m+/spam@airqo.net'.isValidEmail(), isTrue);
      expect('noble@airqo.us'.isValidEmail(), isTrue);
    });

    test('isValidUri should return true if the string is a valid URI', () {
      expect(''.isValidUri(), isFalse);
      expect('airqo'.isValidUri(), isFalse);
      expect('airqo.net'.isValidUri(), isFalse);
      expect('foo.bar.baz'.isValidUri(), isFalse);
      expect('https://www.airqo.net/'.isValidUri(), isTrue);
      expect('ftp://airqo.net/ai.txt'.isValidUri(), isTrue);
      //TODO: Review
      expect('mailto:m.noble@airqo.net'.isValidUri(), isTrue);
    });

    test(
        'toCapitalized should return the string with the first letter capitalized and the rest lowercased',
        () {
      expect(''.toCapitalized(), equals(''));
      expect('hello'.toCapitalized(), equals('Hello'));
      expect('WORLD'.toCapitalized(), equals('World'));
      expect('ii'.toCapitalized(), equals('II'));
      expect('iv'.toCapitalized(), equals('IV'));
    });

    test('toTitleCase should return the string with each word capitalized', () {
      expect(''.toTitleCase(), equals(''));
      expect('noble the great'.toTitleCase(), equals('Noble The Great'));
    });
  });
  group('NullStringExtension', () {
    test(
        'isValidLocation should return true if the string is not null and not empty',
        () {
      expect(null.isValidLocationName(), isFalse);
      expect(''.isValidLocationName(), isFalse);
      expect('Kampala'.isValidLocationName(), isTrue);
    });
  });
  group('DateTimeExtension', () {
    final DateTime today = DateTime.now();
    final fixedTime = DateTime(2023, 5, 3);

    test(
        'isSameDay should return true if it\'s the same day and false otherwise',
        () {
      expect(today.isSameDay(today.add(const Duration(days: 1))), isFalse);
      expect(today.isSameDay(today), isTrue);
    });

    test(
        'analyticsCardString should return the string in the format \'d MMM, hh:mm a\', and print is yesterday if it was yesterday',
        () {
      expect(now.analyticsCardString(),
          equals(DateFormat('d MMM, hh:mm a').format(now)));
      expect(now.subtract(const Duration(days: 1)).analyticsCardString(),
          equals('Yesterday'));
    });

    test('timelineString should return a formatted date string', () {
      expect(dateTime.timelineString(), 'WEDNESDAY 3, MAY');
    });

    test(
        'getDateOfFirstDayOfWeek should return the date of the first day of the week',
        () {
      expect(dateTime.getDateOfFirstDayOfWeek(), DateTime(2023, 5, 1));
      expect(dateTime.add(const Duration(days: 7)).getDateOfFirstDayOfWeek(),
          DateTime(2023, 5, 8));
    });

    test(
        'getDateOfFirstHourOfDay should return the date of the first hour of the day',
        () {
      final dateTime1 = DateTime(2023, 5, 3, 15, 30);
      expect(dateTime1.getDateOfFirstHourOfDay(),
          DateTime.parse('2023-05-03T00:00:00Z'));
      expect(dateTime.add(const Duration(days: 1)).getDateOfFirstHourOfDay(),
          DateTime.parse('2023-05-04T00:00:00Z'));
    });

    test(
        'isAfterOrEqualToYesterday should return true if the date is after or equal to yesterday',
        () {
      expect(dateTime.isAfterOrEqualToYesterday(), isTrue);
      expect(dateTime.add(const Duration(days: 1)).isAfterOrEqualToYesterday(),
          isTrue);
      expect(
          dateTime
              .subtract(const Duration(days: 2))
              .isAfterOrEqualToYesterday(),
          isFalse);
    });

    test(
        'isAfterOrEqualToToday should return true if the date is after or equal to today',
        () {
      expect(dateTime.isAfterOrEqualToToday(), isTrue);
      expect(dateTime.add(const Duration(days: 1)).isAfterOrEqualToToday(),
          isTrue);
      expect(dateTime.subtract(const Duration(days: 1)).isAfterOrEqualToToday(),
          isFalse);
    });

    test(
        'isAfterOrEqualTo should return true if the date is after or equal to another date',
        () {
      expect(dateTime.isAfterOrEqualTo(DateTime(2023, 5, 3)), isTrue);
      expect(
          dateTime.isAfterOrEqualTo(dateTime.subtract(const Duration(days: 1))),
          isTrue);
      expect(dateTime.isAfterOrEqualTo(dateTime.add(const Duration(days: 1))),
          isFalse);
    });

    test(
        'isBeforeOrEqualTo should return true if the date is before or equal to another date',
        () {
      expect(dateTime.isBeforeOrEqualTo(DateTime(2023, 5, 3)), isTrue);
      expect(dateTime.isBeforeOrEqualTo(dateTime.add(const Duration(days: 1))),
          isTrue);
      expect(
          dateTime
              .isBeforeOrEqualTo(dateTime.subtract(const Duration(days: 1))),
          isFalse);
    });

    test(
        'getDateOfLastDayOfWeek should return the date of the last day of the week',
        () {
      expect(dateTime.getDateOfLastDayOfWeek(),
          DateTime.parse('2023-05-07T00:00:00Z'));
      expect(
          dateTime.subtract(const Duration(days: 7)).getDateOfLastDayOfWeek(),
          DateTime.parse('2023-04-30T00:00:00Z'));
    });

    test('getMonthString should return the month name or abbreviation', () {
      expect(dateTime.getMonthString(), 'May');
      expect(dateTime.getMonthString(abbreviate: true), 'May');
      expect(dateTime.add(const Duration(days: 31)).getMonthString(), 'June');
    });

    test('getUtcOffset should return the time zone offset in hours', () {
      expect(dateTime.getUtcOffset(), dateTime.timeZoneOffset.inHours);
      expect(DateTime.utc(2023, 5, 3).getUtcOffset(), 0);
    });

    test('getWeekday should return the weekday name', () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns the weekday name
      expect(dateTime.getWeekday(), 'wednesday');

      // Verify that the method returns a different weekday name for a different date
      expect(dateTime.add(Duration(days: 1)).getWeekday(), 'thursday');

      // Verify that the method returns a different weekday name for a different locale
      expect(DateFormat('EEEE', 'fr_FR').format(dateTime), 'mercredi');
    });

    test('isWithInCurrentWeek returns true for dates within the current week',
        () {
      final currentDate = DateTime.now();
      expect(currentDate.isWithInCurrentWeek(), isTrue);
      expect(
          currentDate.subtract(const Duration(days: 7)).isWithInCurrentWeek(),
          isFalse);
      expect(currentDate.add(const Duration(days: 7)).isWithInCurrentWeek(),
          isFalse);
    });

    test(
        'isWithInPreviousWeek should return true if the date is within the previous week',
        () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns true for a date within the previous week
      expect(dateTime.subtract(Duration(days: 8)).isWithInPreviousWeek(), true);

      // Verify that the method returns false for a date outside the previous week
      expect(
          dateTime.subtract(Duration(days: 15)).isWithInPreviousWeek(), false);

      // Verify that the method returns false for a date in the current week
      expect(dateTime.isWithInPreviousWeek(), false);
    });

    test(
        'isWithInNextWeek should return true if the date is within the next week',
        () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns true for a date within the next week
      expect(dateTime.add(Duration(days: 8)).isWithInNextWeek(), true);

      // Verify that the method returns false for a date outside the next week
      expect(dateTime.add(Duration(days: 15)).isWithInNextWeek(), false);

      // Verify that the method returns false for a date in the current week
      expect(dateTime.isWithInNextWeek(), false);
    });

    // test('isToday returns true for today\'s date', () {
    //   final date = DateTime.now();
    //   expect(date.isToday(), isTrue);
    //   expect(date.add(duration).isToday(), false);
    // });

    test('isAPastDate returns true for past dates', () {
      final date = DateTime.now().subtract(Duration(days: 1));
      expect(date.isAPastDate(), true);
    });

    test('isAPastDate returns false for future dates', () {
      final date = DateTime.now().add(Duration(days: 1));
      expect(date.isAPastDate(), false);
    });

    test('isTomorrow returns true for tomorrow\'s date', () {
      final date = DateTime.now().add(Duration(days: 1));
      expect(date.isTomorrow(), true);
    });

    test('isTomorrow returns false for dates that are not tomorrow', () {
      final date = DateTime.now().add(Duration(days: 2));
      expect(date.isTomorrow(), false);
    });

    test('isAFutureDate should return true if the date is a future date', () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns true for a future date
      expect(dateTime.add(Duration(days: 2)).isAFutureDate(), true);

      // Verify that the method returns true for tomorrow
      expect(dateTime.add(Duration(days: 1)).isAFutureDate(), true);

      // Verify that the method returns false for today
      expect(dateTime.isAFutureDate(), false);

      // Verify that the method returns false for a past date
      expect(dateTime.subtract(Duration(days: 1)).isAFutureDate(), false);
    });

    test('isYesterday should return true if the date is yesterday', () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns true for yesterday
      expect(dateTime.subtract(Duration(days: 1)).isYesterday(), true);

      // Verify that the method returns false for today
      expect(dateTime.isYesterday(), false);

      // Verify that the method returns false for tomorrow
      expect(dateTime.add(Duration(days: 1)).isYesterday(), false);
    });

    test(
        'notificationDisplayDate should return the formatted date for notification display',
        () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3, 10, 15); // Wednesday

      // Verify that the method returns the hour and minute for today
      expect(dateTime.notificationDisplayDate(), '10:15');

      // Verify that the method returns the day and month for yesterday
      expect(dateTime.subtract(Duration(days: 1)).notificationDisplayDate(),
          '2 May');

      // Verify that the method returns the day and month for tomorrow
      expect(
          dateTime.add(Duration(days: 1)).notificationDisplayDate(), '4 May');
    });

    test('tomorrow should return the date of tomorrow', () {
      // Create an instance of the class to test
      final dateTime = DateTime(2023, 5, 3); // Wednesday

      // Verify that the method returns the date of tomorrow
      expect(dateTime.tomorrow(), DateTime(2023, 5, 4));

      // Verify that the method returns a different date for a different day
      expect(dateTime.add(Duration(days: 2)).tomorrow(), DateTime(2023, 5, 6));
    });

    // test('yesterday should return the date of yesterday', () {
    //   // Create an instance of the class to test
    //   final dateTime = DateTime(2023, 5, 3); // Wednesday
    //
    //   // Verify that the method returns the date of yesterday
    //   expect(dateTime.yesterday(), DateTime(2023, 5, 2));
    //
    //   // Verify that the method returns a different date for a different day
    //   expect(dateTime.subtract(Duration(days: 2)).yesterday(), DateTime(2023, 4, 30));
  });
}
