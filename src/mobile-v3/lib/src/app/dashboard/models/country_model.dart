class CountryModel {
  final String flag;
  final String countryName;

  const CountryModel(this.flag, this.countryName);

  static String getFlagFromCountryName(String countryName) {
    final flagMap = {
      'Uganda': '🇺🇬',
      'Kenya': '🇰🇪',
      'Burundi': '🇧🇮',
      'Ghana': '🇬🇭',
      'Nigeria': '🇳🇬',
      'Cameroon': '🇨🇲',
      'South Africa': '🇿🇦',
      'Mozambique': '🇲🇿',
      'Rwanda': '🇷🇼',
      'Ethiopia': '🇪🇹',
      'Senegal': '🇸🇳',
      'Madagascar': '🇲🇬',
      'Democratic Republic Of The Congo': '🇨🇩',
      'Gambia': '🇬🇲',
      'Zambia': '🇿🇲',
    };

    return flagMap[countryName] ?? '🌍';
  }
}