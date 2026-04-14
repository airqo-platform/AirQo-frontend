import 'dart:convert';

CountriesApiResponse countriesApiResponseFromJson(String str) =>
    CountriesApiResponse.fromJson(json.decode(str));

String countriesApiResponseToJson(CountriesApiResponse data) =>
    json.encode(data.toJson());

class CountriesApiResponse {
  bool success;
  String message;
  List<CountryData> countries;

  CountriesApiResponse({
    required this.success,
    required this.message,
    required this.countries,
  });

  factory CountriesApiResponse.fromJson(Map<String, dynamic> json) =>
      CountriesApiResponse(
        success: json["success"] ?? false,
        message: json["message"] ?? "",
        countries: List<CountryData>.from(
            (json["countries"] ?? []).map((x) => CountryData.fromJson(x))),
      );

  Map<String, dynamic> toJson() => {
        "success": success,
        "message": message,
        "countries": List<dynamic>.from(countries.map((x) => x.toJson())),
      };
}

class CountryData {
  String country;
  int sites;
  String flagUrl;

  CountryData({
    required this.country,
    required this.sites,
    required this.flagUrl,
  });

  factory CountryData.fromJson(Map<String, dynamic> json) => CountryData(
        country: json["country"] ?? "",
        sites: json["sites"] is int
            ? json["sites"]
            : int.tryParse(json["sites"]?.toString() ?? "") ?? 0,
        flagUrl: json["flag_url"] ?? "",
      );

  Map<String, dynamic> toJson() => {
        "country": country,
        "sites": sites,
        "flag_url": flagUrl,
      };

  String get formattedCountryName {
    return country
        .split('_')
        .where((word) => word.isNotEmpty)
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}
