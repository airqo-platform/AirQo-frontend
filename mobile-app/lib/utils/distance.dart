String toDistance(double km) {
  var meters = (km * 1000).ceil();
  if (meters > 1000) {
    return '${km.toStringAsFixed(1)} km';
  } else {
    return '$meters meters';
  }
}

double kmIntToMetersDouble(int km) {
  var meters = km * 1000;
  return meters.toDouble();
}
