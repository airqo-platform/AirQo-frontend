/// Short display strings for [TranslatedText] — kept simple for Luganda/Kiswahili.
String learnDisplayTitle(String apiTitle) => apiTitle.trim();

String learnUnitHeader(int unitIndex, String unitTitle) {
  final num = (unitIndex + 1).toString().padLeft(2, '0');
  return 'UNIT $num — ${learnDisplayTitle(unitTitle)}';
}

String learnLessonLabel(int lessonIndex) {
  return 'LESSON ${(lessonIndex + 1).toString().padLeft(2, '0')}';
}
