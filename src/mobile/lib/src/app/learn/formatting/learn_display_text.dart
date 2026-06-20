/// Short display strings for [TranslatedText] — kept simple for Luganda/Kiswahili.
String learnDisplayTitle(String apiTitle) => apiTitle.trim();

String learnUnitHeader(int unitIndex, String unitTitle) {
  final num = (unitIndex + 1).toString().padLeft(2, '0');
  return 'UNIT $num: ${learnDisplayTitle(unitTitle)}';
}

String learnLessonLabel(int lessonIndex) {
  return 'LESSON ${(lessonIndex + 1).toString().padLeft(2, '0')}';
}

String learnLessonHeaderLine(int lessonIndex, String lessonTitle) {
  return '${learnLessonLabel(lessonIndex)}: ${learnDisplayTitle(lessonTitle)}';
}

String learnActivityOrdinal(int activityIndex) {
  const ordinals = [
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
  ];
  return ordinals[activityIndex.clamp(0, ordinals.length - 1)];
}

String learnActivityTypeHeader(int activityIndex, String typeKey) {
  return 'ACTIVITY ${learnActivityOrdinal(activityIndex)}: $typeKey';
}

String learnActivityProgressLabel(int activityIndex, int totalActivities) {
  return 'Activity ${activityIndex + 1} of $totalActivities';
}

String learnLessonUnitContext(int lessonIndex, String unitPlainTitle) {
  return '${learnLessonLabel(lessonIndex)} · ${learnDisplayTitle(unitPlainTitle)}';
}

String learnLessonCompleteSubtitle(int lessonIndex, String unitPlainTitle) {
  final num = (lessonIndex + 1).toString().padLeft(2, '0');
  return 'Lesson $num complete: ${learnDisplayTitle(unitPlainTitle)}';
}

String learnCourseCompletionTime(DateTime completedAt) {
  final day = completedAt.day;
  final month = _monthName(completedAt.month);
  final year = completedAt.year;
  return 'Completed $day $month $year';
}

String learnCourseCompletionRarityLabel({int completionPercent = 17}) {
  return 'Only $completionPercent% of AirQo users have completed this course';
}

String _monthName(int month) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[month - 1];
}
