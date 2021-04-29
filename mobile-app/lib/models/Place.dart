class Place {
  String streetNumber;
  String street;
  String city;
  String zipCode;

  Place({
    required this.streetNumber,
    required this.street,
    required this.city,
    required this.zipCode,
  });

  @override
  String toString() {
    return 'Place(streetNumber: $streetNumber, street: $street, city: $city, zipCode: $zipCode)';
  }
}