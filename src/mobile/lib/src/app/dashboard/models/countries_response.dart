// To parse this JSON data, do
//
//     final countriesResponse = countriesResponseFromJson(jsonString);

import 'dart:convert';

CountriesResponse countriesResponseFromJson(String str) => CountriesResponse.fromJson(json.decode(str));

String countriesResponseToJson(CountriesResponse data) => json.encode(data.toJson());

class CountriesResponse {
    bool success;
    String message;
    List<Grid> grids;

    CountriesResponse({
        required this.success,
        required this.message,
        required this.grids,
    });

    factory CountriesResponse.fromJson(Map<String, dynamic> json) => CountriesResponse(
        success: json["success"],
        message: json["message"],
        grids: List<Grid>.from(json["grids"].map((x) => Grid.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "success": success,
        "message": message,
        "grids": List<dynamic>.from(grids.map((x) => x.toJson())),
    };
}

class Grid {
    String id;
    bool visibility;
    String name;
    AdminLevel adminLevel;
    Network network;
    LongName longName;
    DateTime createdAt;
    List<Site> sites;
    int numberOfSites;

    Grid({
        required this.id,
        required this.visibility,
        required this.name,
        required this.adminLevel,
        required this.network,
        required this.longName,
        required this.createdAt,
        required this.sites,
        required this.numberOfSites,
    });

    factory Grid.fromJson(Map<String, dynamic> json) => Grid(
        id: json["_id"],
        visibility: json["visibility"],
        name: json["name"],
        adminLevel: adminLevelValues.map[json["admin_level"]]!,
        network: networkValues.map[json["network"]]!,
        longName: longNameValues.map[json["long_name"]]!,
        createdAt: DateTime.parse(json["createdAt"]),
        sites: List<Site>.from(json["sites"].map((x) => Site.fromJson(x))),
        numberOfSites: json["numberOfSites"],
    );

    Map<String, dynamic> toJson() => {
        "_id": id,
        "visibility": visibility,
        "name": name,
        "admin_level": adminLevelValues.reverse[adminLevel],
        "network": networkValues.reverse[network],
        "long_name": longNameValues.reverse[longName],
        "createdAt": createdAt.toIso8601String(),
        "sites": List<dynamic>.from(sites.map((x) => x.toJson())),
        "numberOfSites": numberOfSites,
    };
}

enum AdminLevel {
    COUNTRY
}

final adminLevelValues = EnumValues({
    "country": AdminLevel.COUNTRY
});

enum LongName {
    BURUNDI,
    CAMEROON,
    DEMOCRATIC_REPUBLIC_OF_THE_CONGO,
    ETHIOPIA,
    GHANA,
    KENYA,
    LONG_NAME_SOUTH_AFRICA,
    MADAGASCAR,
    MOZAMBIQUE,
    NIGERIA,
    RWANDA,
    SENEGAL,
    SOUTH_AFRICA,
    UGANDA
}

final longNameValues = EnumValues({
    "Burundi": LongName.BURUNDI,
    "Cameroon": LongName.CAMEROON,
    "Democratic Republic of the Congo": LongName.DEMOCRATIC_REPUBLIC_OF_THE_CONGO,
    "Ethiopia": LongName.ETHIOPIA,
    "Ghana": LongName.GHANA,
    "Kenya": LongName.KENYA,
    "South_Africa": LongName.LONG_NAME_SOUTH_AFRICA,
    "Madagascar": LongName.MADAGASCAR,
    "Mozambique": LongName.MOZAMBIQUE,
    "Nigeria": LongName.NIGERIA,
    "Rwanda": LongName.RWANDA,
    "Senegal": LongName.SENEGAL,
    "South Africa": LongName.SOUTH_AFRICA,
    "Uganda": LongName.UGANDA
});

enum Network {
    AIRQO
}

final networkValues = EnumValues({
    "airqo": Network.AIRQO
});

class Site {
    String id;
    String formattedName;
    String? parish;
    String? subCounty;
    String? city;
    String region;
    LongName country;
    String name;
    double approximateLatitude;
    double approximateLongitude;
    String locationName;
    String searchName;
    DataProvider dataProvider;
    List<dynamic>? images;
    List<dynamic>? landUse;
    bool? visibility;
    String? district;
    String? county;

    Site({
        required this.id,
        required this.formattedName,
        this.parish,
        this.subCounty,
        this.city,
        required this.region,
        required this.country,
        required this.name,
        required this.approximateLatitude,
        required this.approximateLongitude,
        required this.locationName,
        required this.searchName,
        required this.dataProvider,
        this.images,
        this.landUse,
        this.visibility,
        this.district,
        this.county,
    });

    factory Site.fromJson(Map<String, dynamic> json) => Site(
        id: json["_id"],
        formattedName: json["formatted_name"],
        parish: json["parish"],
        subCounty: json["sub_county"],
        city: json["city"],
        region: json["region"],
        country: longNameValues.map[json["country"]]!,
        name: json["name"],
        approximateLatitude: json["approximate_latitude"]?.toDouble(),
        approximateLongitude: json["approximate_longitude"]?.toDouble(),
        locationName: json["location_name"],
        searchName: json["search_name"],
        dataProvider: dataProviderValues.map[json["data_provider"]]!,
        images: json["images"] == null ? [] : List<dynamic>.from(json["images"]!.map((x) => x)),
        landUse: json["land_use"] == null ? [] : List<dynamic>.from(json["land_use"]!.map((x) => x)),
        visibility: json["visibility"],
        district: json["district"],
        county: json["county"],
    );

    Map<String, dynamic> toJson() => {
        "_id": id,
        "formatted_name": formattedName,
        "parish": parish,
        "sub_county": subCounty,
        "city": city,
        "region": region,
        "country": longNameValues.reverse[country],
        "name": name,
        "approximate_latitude": approximateLatitude,
        "approximate_longitude": approximateLongitude,
        "location_name": locationName,
        "search_name": searchName,
        "data_provider": dataProviderValues.reverse[dataProvider],
        "images": images == null ? [] : List<dynamic>.from(images!.map((x) => x)),
        "land_use": landUse == null ? [] : List<dynamic>.from(landUse!.map((x) => x)),
        "visibility": visibility,
        "district": district,
        "county": county,
    };
}

enum DataProvider {
    AIR_QO,
    US_EMBASSY
}

final dataProviderValues = EnumValues({
    "AirQo": DataProvider.AIR_QO,
    "US Embassy": DataProvider.US_EMBASSY
});

class EnumValues<T> {
    Map<String, T> map;
    late Map<T, String> reverseMap;

    EnumValues(this.map);

    Map<T, String> get reverse {
            reverseMap = map.map((k, v) => MapEntry(v, k));
            return reverseMap;
    }
}
