class Pollutant {
  Pollutant(this._pollutant, this._description, this._source, this._effects,
      this._howToReduce);

  final String _pollutant;
  final String _description;
  final String _source;
  final String _effects;
  final String _howToReduce;

  String get pollutant => _pollutant;

  String get description => _description;

  String get howToReduce => _howToReduce;

  String get effects => _effects;

  String get source => _source;
}
