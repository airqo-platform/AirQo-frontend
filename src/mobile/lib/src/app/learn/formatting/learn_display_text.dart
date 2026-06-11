/// Maps API / catalog jargon titles to plain-language keys for [TranslatedText].
String learnDisplayTitle(String apiTitle) {
  final key = apiTitle.trim().toLowerCase();
  const map = <String, String>{
    'sources': 'Where pollution comes from',
    'source': 'Where pollution comes from',
    'health effects': 'How dirty air affects your body',
    'health': 'How dirty air affects your body',
    'aqi scale': 'What the numbers mean',
    'take action': 'Simple steps you can take',
    'air basics': 'What is in the air around you',
    'know your air': 'Know Your Air',
    'your cooking fire': 'Your cooking fire',
    'road outside your door': 'Road outside your door',
    'open burning': 'Open burning',
    'workshop dust': 'Workshop dust',
    'eyes and lungs': 'Eyes and lungs',
    'children first': 'Children first',
  };

  if (map.containsKey(key)) return map[key]!;
  for (final entry in map.entries) {
    if (key.contains(entry.key)) return entry.value;
  }
  return apiTitle;
}

String learnUnitHeader(int unitIndex, String unitTitle) {
  final plain = learnDisplayTitle(unitTitle);
  final num = (unitIndex + 1).toString().padLeft(2, '0');
  return 'UNIT $num — $plain';
}

String learnLessonLabel(int lessonIndex) {
  return 'LESSON ${(lessonIndex + 1).toString().padLeft(2, '0')}';
}
