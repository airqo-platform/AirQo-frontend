class Language {
  final int id;
  final String flagEmoji; 

  final String name;
  final String languageCode;

  Language(this.id, this.flagEmoji, this.name, this.languageCode);

  static List<Language> languageList() {
    return <Language>[
      Language(1, "🇺🇸", "English", "en"),
      Language(2, "🇫🇷", "French", "fr"),
      Language(3, "🇵🇹", "Portuguese", "pt"),
    ];
  }
}
