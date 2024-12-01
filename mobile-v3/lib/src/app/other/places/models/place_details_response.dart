class PlaceDetailsResponse {
    List<Candidate> candidates;
    String status;

    PlaceDetailsResponse({
        required this.candidates,
        required this.status,
    });

    factory PlaceDetailsResponse.fromJson(Map<String, dynamic> json) => PlaceDetailsResponse(
        candidates: List<Candidate>.from(json["candidates"].map((x) => Candidate.fromJson(x))),
        status: json["status"],
    );

    Map<String, dynamic> toJson() => {
        "candidates": List<dynamic>.from(candidates.map((x) => x.toJson())),
        "status": status,
    };
}

class Candidate {
    Geometry geometry;

    Candidate({
        required this.geometry,
    });

    factory Candidate.fromJson(Map<String, dynamic> json) => Candidate(
        geometry: Geometry.fromJson(json["geometry"]),
    );

    Map<String, dynamic> toJson() => {
        "geometry": geometry.toJson(),
    };
}

class Geometry {
    Location location;
    Viewport viewport;

    Geometry({
        required this.location,
        required this.viewport,
    });

    factory Geometry.fromJson(Map<String, dynamic> json) => Geometry(
        location: Location.fromJson(json["location"]),
        viewport: Viewport.fromJson(json["viewport"]),
    );

    Map<String, dynamic> toJson() => {
        "location": location.toJson(),
        "viewport": viewport.toJson(),
    };
}

class Location {
    double lat;
    double lng;

    Location({
        required this.lat,
        required this.lng,
    });

    factory Location.fromJson(Map<String, dynamic> json) => Location(
        lat: json["lat"]?.toDouble(),
        lng: json["lng"]?.toDouble(),
    );

    Map<String, dynamic> toJson() => {
        "lat": lat,
        "lng": lng,
    };
}

class Viewport {
    Location northeast;
    Location southwest;

    Viewport({
        required this.northeast,
        required this.southwest,
    });

    factory Viewport.fromJson(Map<String, dynamic> json) => Viewport(
        northeast: Location.fromJson(json["northeast"]),
        southwest: Location.fromJson(json["southwest"]),
    );

    Map<String, dynamic> toJson() => {
        "northeast": northeast.toJson(),
        "southwest": southwest.toJson(),
    };
}
