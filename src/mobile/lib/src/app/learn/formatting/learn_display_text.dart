/// Short display strings for [TranslatedText] — kept simple for Luganda/Kiswahili.
String learnDisplayTitle(String apiTitle) => apiTitle.trim();

String learnUnitHeader(int unitIndex, String unitTitle) {
  final num = (unitIndex + 1).toString().padLeft(2, '0');
  return 'UNIT $num — ${learnDisplayTitle(unitTitle)}';
}

String learnLessonLabel(int lessonIndex) {
  return 'LESSON ${(lessonIndex + 1).toString().padLeft(2, '0')}';
}

String learnLessonHeaderLine(int lessonIndex, String lessonTitle) {
  return '${learnLessonLabel(lessonIndex)} — ${learnDisplayTitle(lessonTitle)}';
}

String learnActivityProgressLabel(int activityIndex, int totalActivities) {
  return 'Activity ${activityIndex + 1} of $totalActivities';
}

String learnLessonUnitContext(int lessonIndex, String unitPlainTitle) {
  return '${learnLessonLabel(lessonIndex)} · ${learnDisplayTitle(unitPlainTitle)}';
}

String learnLessonCompleteSubtitle(int lessonIndex, String unitPlainTitle) {
  final num = (lessonIndex + 1).toString().padLeft(2, '0');
  return 'Lesson $num complete — ${learnDisplayTitle(unitPlainTitle)}';
}
