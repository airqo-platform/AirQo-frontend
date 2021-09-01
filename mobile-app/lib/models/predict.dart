import 'package:app/models/site.dart';
import 'package:json_annotation/json_annotation.dart';

part 'predict.g.dart';

@JsonSerializable()
class Predict {
  @JsonKey(required: true, name: 'prediction_time')
  String time;

  @JsonKey(required: true, name: 'prediction_value')
  double value;

  @JsonKey(required: true, name: 'lower_ci')
  double lower;

  @JsonKey(required: true, name: 'upper_ci')
  double upper;

  @JsonKey(required: false)
  String site = '';

  Predict({
    required this.value,
    required this.lower,
    required this.time,
    required this.upper,
  });

  factory Predict.fromJson(Map<String, dynamic> json) =>
      _$PredictFromJson(json);

  Map<String, dynamic> toJson() => _$PredictToJson(this);

  static String createTableStmt() =>
      'CREATE TABLE IF NOT EXISTS ${forecastDb()}('
      'id INTEGER PRIMARY KEY, ${Site.dbId()} TEXT,'
      '${dbTime()} TEXT, ${dbUpper()} REAL, '
      '${dbValue()} REAL, ${dbLower()} REAL)';

  static String dbLower() => 'lower';

  static String dbTime() => 'time';

  static String dbUpper() => 'upper';

  static String dbValue() => 'value';

  static String dropTableStmt() => 'DROP TABLE IF EXISTS ${forecastDb()}';

  static String forecastDb() => 'forecast_measurements';

  static Map<String, dynamic> mapFromDb(Map<String, dynamic> json) {
    return {
      'prediction_time': json['${dbTime()}'] as String,
      'prediction_value': json['${dbValue()}'] as double,
      'lower_ci': json['${dbLower()}'] as double,
      'upper_ci': json['${dbUpper()}'] as double,
    };
  }

  static Map<String, dynamic> mapToDb(Predict predict, String siteId) {
    return {
      '${dbTime()}': predict.time,
      '${Site.dbId()}': siteId,
      '${dbValue()}': predict.value,
      '${dbLower()}': predict.lower,
      '${dbUpper()}': predict.upper
    };
  }

  static List<Predict> parsePredictions(dynamic jsonBody) {
    var predictions = <Predict>[];

    for (var element in jsonBody) {
      try {
        var predict = Predict.fromJson(element);
        predictions.add(predict);
      } on Error catch (e) {
        print('Parse predictions error: $e');
      }
    }

    return predictions;
  }
}
