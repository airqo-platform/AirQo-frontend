import 'package:app/utils/utils.dart';
import 'package:flutter/cupertino.dart';
import 'package:json_annotation/json_annotation.dart';

part 'address.g.dart';

@JsonSerializable(createToJson: false)
class AddressComponent {
  AddressComponent({
    required this.shortName,
    required this.longName,
    required this.types,
  });

  factory AddressComponent.fromJson(Map<String, dynamic> json) =>
      _$AddressComponentFromJson(json);
  @JsonKey(name: 'short_name')
  final String shortName;
  @JsonKey(name: 'long_name')
  final String longName;
  final List<String> types;
}

class Address {
  Address({
    required this.id,
    required this.name,
    required this.location,
    required this.latitude,
    required this.longitude,
  });

  factory Address.fromGeocodingAPI(Map<String, dynamic> json) {
    Map<String, dynamic> geometry =
        json["geometry"]["location"] as Map<String, dynamic>;

    List<AddressComponent> addressComponents = [];
    for (dynamic component in json["address_components"] as List<dynamic>) {
      try {
        addressComponents
            .add(AddressComponent.fromJson(component as Map<String, dynamic>));
      } catch (e) {
        debugPrint(e.toString());
      }
    }

    return Address(
      id: json["place_id"] as String,
      name: addressComponents.getName(),
      location: addressComponents.getLocation(),
      latitude: geometry["lat"] as double,
      longitude: geometry["lng"] as double,
    );
  }

  final String id;
  final String name;
  final String location;
  final double latitude;
  final double longitude;
}
