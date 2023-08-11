import 'package:app/utils/utils.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
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
      expect((-3.0).isWithin(startValue, endValue), isFalse);
    });

    test('returns true when subject is equal to the limits of the range', () {
      expect(0.0.isWithin(startValue, 0.0), isTrue);
    });
  });
  group('StringExtension', () {
    test('getFirstAndLastNames should return a list of two strings', () {
      expect('Noble The Great'.getFirstAndLastNames(),
          equals(['Noble', 'The Great']));
      expect('John Doe'.getFirstAndLastNames(), equals(['John', 'Doe']));
      expect('Mary'.getFirstAndLastNames(), equals(['Mary', '']));
      expect(''.getFirstAndLastNames(), equals(['', '']));
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
      expect('12345!8901'.isValidPhoneNumber(), isFalse);
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
      expect('noble@airqo'.isValidEmail(), isFalse);
      expect('noble@airqo.google.com'.isValidEmail(), isTrue);
      expect('\$@example.com'.isValidEmail(), isFalse);
      expect('@example.com'.isValidEmail(), isFalse);
      expect('john.doe@example.'.isValidEmail(), isFalse);
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
    const day = Duration(days: 1);
    final DateTime today = DateTime.now();
    final DateTime yesterday = today.subtract(day);
    final DateTime tomorrow = today.add(day);

    final fixedDate1 = DateTime(2023, 5, 4);
    final fixedDate3 = DateTime(2023, 5, 4, 8, 45, 53);

    test(
        'isSameDay should return true if it\'s the same day and false otherwise',
        () {
      expect(today.isSameDay(tomorrow), isFalse);
      expect(today.isSameDay(yesterday), isFalse);
      expect(today.isSameDay(today), isTrue);
    });

    testWidgets('analyticsCardString returns correct string for yesterday',
        (WidgetTester tester) async {
      final key = GlobalKey();

      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en'),
            Locale('fr'),
          ],
          home: Text(
            key: key,
            'analyticsCardString returns correct string for yesterday',
          ),
        ),
      );
      await tester.pumpAndSettle();

      BuildContext? buildContext = key.currentContext;
      expect(buildContext, isNotNull);

      if (buildContext == null) {
        return;
      }
      String expected1 =
          'Updated yesterday at ${DateFormat('hh:mm a').format(yesterday)}';
      String expected2 =
          'Updated today at ${DateFormat('hh:mm a').format(today)}';
      String expected3 = 'Tomorrow, ${DateFormat('hh:mm a').format(tomorrow)}';
      String expected4 = '4 May, 08:45 AM';
      expect(yesterday.analyticsCardString(buildContext), expected1);
      expect(today.analyticsCardString(buildContext), expected2);
      expect(tomorrow.analyticsCardString(buildContext), expected3);
      expect(fixedDate3.analyticsCardString(buildContext), expected4);
    });

    testWidgets('timelineString should return a formatted date string',
        (WidgetTester tester) async {
      final key = GlobalKey();

      await tester.pumpWidget(
        MaterialApp(
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en'),
            Locale('fr'),
          ],
          home: Text(
            key: key,
            'timelineString should return a formatted date string',
          ),
        ),
      );
      await tester.pumpAndSettle();

      BuildContext? buildContext = key.currentContext;
      expect(buildContext, isNotNull);

      if (buildContext == null) {
        return;
      }
      expect(fixedDate1.timelineString(buildContext), 'THURSDAY 4, MAY');
    });

    test(
        'getDateOfFirstDayOfWeek (in UTC format) should return the date of the first day of the week',
        () {
      expect(fixedDate1.getDateOfFirstDayOfWeek(), DateTime.utc(2023, 5, 1));
      expect(fixedDate1.add(const Duration(days: 7)).getDateOfFirstDayOfWeek(),
          DateTime.utc(2023, 5, 8));
    });

    test(
        'getDateOfFirstHourOfDay should return the date of the first hour of the day',
        () {
      expect(fixedDate3.getDateOfFirstHourOfDay(),
          DateTime.parse('2023-05-04T00:00:00Z'));
      expect(fixedDate1.add(day).getDateOfFirstHourOfDay(),
          DateTime.parse('2023-05-05T00:00:00Z'));
    });

    test(
        'isAfterOrEqualToYesterday should return true if the date is after or equal to yesterday',
        () {
      expect(today.isAfterOrEqualToYesterday(), isTrue);
      expect(today.add(day).isAfterOrEqualToYesterday(), isTrue);
      expect(
          today.subtract(const Duration(days: 2)).isAfterOrEqualToYesterday(),
          isFalse);
    });

    test(
        'isAfterOrEqualToToday should return true if the date is after or equal to today',
        () {
      expect(today.isAfterOrEqualToToday(), isTrue);
      expect(today.add(day).isAfterOrEqualToToday(), isTrue);
      expect(today.subtract(const Duration(days: 2)).isAfterOrEqualToToday(),
          isFalse);
    });

    test(
        'isAfterOrEqualTo should return true if the date is after or equal to another date',
        () {
      expect(fixedDate1.isAfterOrEqualTo(fixedDate1.add(day)), isFalse);
      expect(fixedDate1.isAfterOrEqualTo(fixedDate1), isTrue);
      expect(fixedDate1.isAfterOrEqualTo(fixedDate1.subtract(day)), isTrue);
    });

    test(
        'isBeforeOrEqualTo should return true if the date is before or equal to another date',
        () {
      expect(fixedDate1.isBeforeOrEqualTo(fixedDate1), isTrue);
      expect(fixedDate1.isBeforeOrEqualTo(fixedDate1.add(day)), isTrue);
      expect(fixedDate1.isBeforeOrEqualTo(fixedDate1.subtract(day)), isFalse);
    });

    test(
        'getDateOfLastDayOfWeek should return the date of the last day of the week',
        () {
      expect(fixedDate1.getDateOfLastDayOfWeek(),
          DateTime.parse('2023-05-07T00:00:00Z'));
      expect(
          fixedDate1.subtract(const Duration(days: 7)).getDateOfLastDayOfWeek(),
          DateTime.parse('2023-04-30T00:00:00Z'));
    });

    test('getMonthString should return the month name or abbreviation', () {
      expect(fixedDate1.getMonthString(), 'May');
      expect(fixedDate1.getMonthString(abbreviate: true), 'May');
      expect(fixedDate1.add(const Duration(days: 31)).getMonthString(), 'June');
    });

    test('getUtcOffset should return the time zone offset in hours', () {
      expect(fixedDate1.getUtcOffset(), fixedDate1.timeZoneOffset.inHours);
      expect(DateTime.utc(2023, 5, 3).getUtcOffset(), 0);
    });

    test('getWeekday should return the weekday name', () {
      expect(fixedDate1.getWeekday(), 'Thursday');
      expect(fixedDate1.add(day).getWeekday(), 'Friday');
    });

    test('isWithInCurrentWeek returns true for dates within the current week',
        () {
      expect(today.isWithInCurrentWeek(), isTrue);
      expect(today.subtract(const Duration(days: 7)).isWithInCurrentWeek(),
          isFalse);
      expect(today.add(const Duration(days: 7)).isWithInCurrentWeek(), isFalse);
    });

    test(
        'isWithInPreviousWeek should return true if the date is within the previous week',
        () {
      expect(today.isWithInNextWeek(), isFalse);
      expect(
          today.add(const Duration(days: 7)).isWithInPreviousWeek(), isFalse);
      expect(today.subtract(const Duration(days: 7)).isWithInPreviousWeek(),
          isTrue);
      expect(
          today.subtract(Duration(days: 7 + today.weekday)).isWithInNextWeek(),
          isFalse);
    });

    test(
        'isWithInNextWeek should return true if the date is within the next week',
        () {
      expect(today.add(const Duration(days: 7)).isWithInNextWeek(), isTrue);
      expect(today.add(const Duration(days: 14)).isWithInNextWeek(), isFalse);

      if (today.weekday > 7) {
        expect(today.isWithInNextWeek(), isTrue);
      } else {
        expect(today.isWithInNextWeek(), isFalse);
      }

      if (tomorrow.weekday == 1) {
        expect(tomorrow.isWithInNextWeek(), isTrue);
      } else {
        expect(tomorrow.isWithInNextWeek(), isFalse);
      }
    });

    test('isToday returns true for today\'s date', () {
      expect(today.isToday(), isTrue);
      expect(today.add(day).isToday(), isFalse);
    });

    test('isAPastDate returns true for past dates', () {
      expect(today.subtract(day).isAPastDate(), isTrue);
      expect(today.isAPastDate(), isFalse);
      expect(tomorrow.isAPastDate(), isFalse);
    });

    test('isTomorrow returns true for tomorrow\'s date', () {
      expect(today.isTomorrow(), isFalse);
      expect(tomorrow.isTomorrow(), isTrue);
    });

    test('isAFutureDate should return true if the date is a future date', () {
      expect(today.add(day).isAFutureDate(), isTrue);
      expect(today.isAFutureDate(), isFalse);
      expect(today.subtract(day).isAFutureDate(), isFalse);
    });

    test('isYesterday should return true if the date is yesterday', () {
      expect(today.subtract(day).isYesterday(), isTrue);
      expect(today.isYesterday(), isFalse);
      expect(today.add(day).isYesterday(), isFalse);
    });

    test('tomorrow should return the date of tomorrow', () {
      expect(today.tomorrow().weekday, tomorrow.weekday);
      expect(today.tomorrow().day, tomorrow.day);
      expect(today.tomorrow().month, tomorrow.month);
      expect(today.tomorrow().year, tomorrow.year);
    });

    test('yesterday should return the date of yesterday', () {
      expect(today.yesterday().weekday, yesterday.weekday);
      expect(today.yesterday().day, yesterday.day);
      expect(today.yesterday().month, yesterday.month);
      expect(today.yesterday().year, yesterday.year);
    });
  });
}
