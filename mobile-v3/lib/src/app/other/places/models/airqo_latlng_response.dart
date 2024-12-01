
import 'dart:convert';

import '../../../dashboard/models/airquality_response.dart';

AirqoLatLngResponse airqoLatLngResponseFromJson(String str) => AirqoLatLngResponse.fromJson(json.decode(str));

String airqoLatLngResponseToJson(AirqoLatLngResponse data) => json.encode(data.toJson());

class AirqoLatLngResponse {
    bool success;
    bool isCache;
    String message;
    Meta meta;
    List<Measurement> measurements;

    AirqoLatLngResponse({
        required this.success,
        required this.isCache,
        required this.message,
        required this.meta,
        required this.measurements,
    });

    factory AirqoLatLngResponse.fromJson(Map<String, dynamic> json) => AirqoLatLngResponse(
        success: json["success"],
        isCache: json["isCache"],
        message: json["message"],
        meta: Meta.fromJson(json["meta"]),
        measurements: List<Measurement>.from(json["measurements"].map((x) => Measurement.fromJson(x))),
    );

    Map<String, dynamic> toJson() => {
        "success": success,
        "isCache": isCache,
        "message": message,
        "meta": meta.toJson(),
        "measurements": List<dynamic>.from(measurements.map((x) => x.toJson())),
    };
}


class Meta {
    int total;
    int skip;
    int limit;
    int page;
    int pages;
    DateTime startTime;
    DateTime endTime;

    Meta({
        required this.total,
        required this.skip,
        required this.limit,
        required this.page,
        required this.pages,
        required this.startTime,
        required this.endTime,
    });

    factory Meta.fromJson(Map<String, dynamic> json) => Meta(
        total: json["total"],
        skip: json["skip"],
        limit: json["limit"],
        page: json["page"],
        pages: json["pages"],
        startTime: DateTime.parse(json["startTime"]),
        endTime: DateTime.parse(json["endTime"]),
    );

    Map<String, dynamic> toJson() => {
        "total": total,
        "skip": skip,
        "limit": limit,
        "page": page,
        "pages": pages,
        "startTime": startTime.toIso8601String(),
        "endTime": endTime.toIso8601String(),
    };
}
