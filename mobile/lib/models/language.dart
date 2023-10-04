class Language {
  final int id;
  final String name;
  final String languageCode;
  final String flagEmoji; // Change the property name to flagEmoji

  Language(this.id, this.name, this.languageCode, this.flagEmoji);

  static List<Language> languageList() {
    return <Language>[
      Language(1, "🇺🇸","English", "en"), 
      Language(2,  "🇫🇷","French", "fr"),  
      Language(3,"🇵🇹", "Portuguese", "pt"), 
    ];
  }
}
