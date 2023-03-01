import 'package:app/models/models.dart';
import 'package:app/utils/utils.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:stream_transform/stream_transform.dart';

String chartTitleDateTimeTitle({
  required DateTime dateTime,
  required Frequency frequency,
  bool showingForecast = false,
}) {
  if (showingForecast) {
    if (dateTime.isToday()) {
      return 'Today’s forecast';
    } else if (dateTime.isTomorrow()) {
      return 'Tomorrow’s forecast';
    } else {
      return dateTime.getLongDate();
    }
  }
  try {
    String prefix = '';
    String suffix = '';
    switch (frequency) {
      case Frequency.daily:
        suffix = '${dateTime.getDateOfFirstDayOfWeek().getShortDate()}'
            ' - '
            '${dateTime.getDateOfLastDayOfWeek().getShortDate()}';

        if (dateTime.isInWeek('last')) {
          prefix = 'Last Week';
        } else if (dateTime.isInWeek('this')) {
          prefix = 'This Week';
        } else if (dateTime.isInWeek('next')) {
          prefix = 'Next Week';
        } else {
          prefix = '';
        }
        break;
      case Frequency.hourly:
        suffix = dateTime.getLongDate();

        if (dateTime.isToday()) {
          prefix = 'Today';
        } else if (dateTime.isYesterday()) {
          prefix = 'Yesterday';
        } else if (dateTime.isTomorrow()) {
          prefix = 'Tomorrow';
        } else {
          prefix = dateTime.getWeekday().toTitleCase();
        }
        break;
    }

    return prefix == '' ? suffix : '$prefix, $suffix';
  } catch (exception, stackTrace) {
    logException(exception, stackTrace);

    return dateTime.toString();
  }
}

List<ChartData> formatData(
  List<ChartData> data,
  Frequency frequency,
) {
  data.sort(
    (x, y) {
      if (frequency == Frequency.daily) {
        return x.dateTime.weekday.compareTo(y.dateTime.weekday);
      }

      return x.dateTime.compareTo(y.dateTime);
    },
  );

  return data;
}

List<ChartData> fillMissingData(
  List<ChartData> data,
  Frequency frequency,
) {
  final insights = <ChartData>[...data];

  switch (frequency) {
    case Frequency.daily:
      final referenceInsight = data.first;

      var startDate = DateTime.now().getFirstDateOfCalendarMonth();
      final lastDayOfCalendar = DateTime.now().getLastDateOfCalendarMonth();

      while (startDate.isBefore(lastDayOfCalendar)) {
        final checkDate = insights
            .where(
              (element) =>
                  (element.dateTime.day == startDate.day) &&
                  (element.dateTime.month == startDate.month),
            )
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            ChartData(
              dateTime: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              available: true,
              siteId: referenceInsight.siteId,
              frequency: referenceInsight.frequency,
            ),
          );
        }

        startDate = startDate.add(
          const Duration(days: 1),
        );
      }
      break;
    case Frequency.hourly:
      final referenceInsight = data.first;

      var startDate = referenceInsight.dateTime
          .getDateOfFirstDayOfWeek()
          .getDateOfFirstHourOfDay();
      final lastDayOfWeek = referenceInsight.dateTime
          .getDateOfLastDayOfWeek()
          .getDateOfLastHourOfDay();

      while (startDate.isBefore(lastDayOfWeek)) {
        final checkDate = insights
            .where((element) =>
                (element.dateTime.hour == startDate.hour) &&
                (element.dateTime.day == startDate.day))
            .toList();

        if (checkDate.isEmpty) {
          insights.add(
            ChartData(
              dateTime: startDate,
              pm2_5: referenceInsight.pm2_5,
              pm10: referenceInsight.pm10,
              available: true,
              siteId: referenceInsight.siteId,
              frequency: referenceInsight.frequency,
            ),
          );
        }

        startDate = startDate.add(
          const Duration(hours: 1),
        );
      }
      break;
  }

  return formatData(insights, frequency);
}

EventTransformer<Event> debounce<Event>(Duration duration) {
  return (events, mapper) => events.debounce(duration).switchMap(mapper);
}
