// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// **************************************************************************
// DriftDatabaseGenerator
// **************************************************************************

// ignore_for_file: type=lint
class GraphInsightData extends DataClass
    implements Insertable<GraphInsightData> {
  final DateTime time;
  final double pm2_5;
  final double pm10;
  final bool empty;
  final bool forecast;
  final String siteId;
  final Frequency frequency;
  const GraphInsightData(
      {required this.time,
      required this.pm2_5,
      required this.pm10,
      required this.empty,
      required this.forecast,
      required this.siteId,
      required this.frequency});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['time'] = Variable<DateTime>(time);
    map['pm2_5'] = Variable<double>(pm2_5);
    map['pm10'] = Variable<double>(pm10);
    map['empty'] = Variable<bool>(empty);
    map['forecast'] = Variable<bool>(forecast);
    map['site_id'] = Variable<String>(siteId);
    {
      final converter = $GraphInsightTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency));
    }
    return map;
  }

  GraphInsightCompanion toCompanion(bool nullToAbsent) {
    return GraphInsightCompanion(
      time: Value(time),
      pm2_5: Value(pm2_5),
      pm10: Value(pm10),
      empty: Value(empty),
      forecast: Value(forecast),
      siteId: Value(siteId),
      frequency: Value(frequency),
    );
  }

  factory GraphInsightData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return GraphInsightData(
      time: serializer.fromJson<DateTime>(json['time']),
      pm2_5: serializer.fromJson<double>(json['pm2_5']),
      pm10: serializer.fromJson<double>(json['pm10']),
      empty: serializer.fromJson<bool>(json['empty']),
      forecast: serializer.fromJson<bool>(json['forecast']),
      siteId: serializer.fromJson<String>(json['siteId']),
      frequency: serializer.fromJson<Frequency>(json['frequency']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'time': serializer.toJson<DateTime>(time),
      'pm2_5': serializer.toJson<double>(pm2_5),
      'pm10': serializer.toJson<double>(pm10),
      'empty': serializer.toJson<bool>(empty),
      'forecast': serializer.toJson<bool>(forecast),
      'siteId': serializer.toJson<String>(siteId),
      'frequency': serializer.toJson<Frequency>(frequency),
    };
  }

  GraphInsightData copyWith(
          {DateTime? time,
          double? pm2_5,
          double? pm10,
          bool? empty,
          bool? forecast,
          String? siteId,
          Frequency? frequency}) =>
      GraphInsightData(
        time: time ?? this.time,
        pm2_5: pm2_5 ?? this.pm2_5,
        pm10: pm10 ?? this.pm10,
        empty: empty ?? this.empty,
        forecast: forecast ?? this.forecast,
        siteId: siteId ?? this.siteId,
        frequency: frequency ?? this.frequency,
      );
  @override
  String toString() {
    return (StringBuffer('GraphInsightData(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('empty: $empty, ')
          ..write('forecast: $forecast, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(time, pm2_5, pm10, empty, forecast, siteId, frequency);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is GraphInsightData &&
          other.time == this.time &&
          other.pm2_5 == this.pm2_5 &&
          other.pm10 == this.pm10 &&
          other.empty == this.empty &&
          other.forecast == this.forecast &&
          other.siteId == this.siteId &&
          other.frequency == this.frequency);
}

class GraphInsightCompanion extends UpdateCompanion<GraphInsightData> {
  final Value<DateTime> time;
  final Value<double> pm2_5;
  final Value<double> pm10;
  final Value<bool> empty;
  final Value<bool> forecast;
  final Value<String> siteId;
  final Value<Frequency> frequency;
  const GraphInsightCompanion({
    this.time = const Value.absent(),
    this.pm2_5 = const Value.absent(),
    this.pm10 = const Value.absent(),
    this.empty = const Value.absent(),
    this.forecast = const Value.absent(),
    this.siteId = const Value.absent(),
    this.frequency = const Value.absent(),
  });
  GraphInsightCompanion.insert({
    required DateTime time,
    required double pm2_5,
    required double pm10,
    this.empty = const Value.absent(),
    this.forecast = const Value.absent(),
    required String siteId,
    required Frequency frequency,
  })  : time = Value(time),
        pm2_5 = Value(pm2_5),
        pm10 = Value(pm10),
        siteId = Value(siteId),
        frequency = Value(frequency);
  static Insertable<GraphInsightData> custom({
    Expression<DateTime>? time,
    Expression<double>? pm2_5,
    Expression<double>? pm10,
    Expression<bool>? empty,
    Expression<bool>? forecast,
    Expression<String>? siteId,
    Expression<int>? frequency,
  }) {
    return RawValuesInsertable({
      if (time != null) 'time': time,
      if (pm2_5 != null) 'pm2_5': pm2_5,
      if (pm10 != null) 'pm10': pm10,
      if (empty != null) 'empty': empty,
      if (forecast != null) 'forecast': forecast,
      if (siteId != null) 'site_id': siteId,
      if (frequency != null) 'frequency': frequency,
    });
  }

  GraphInsightCompanion copyWith(
      {Value<DateTime>? time,
      Value<double>? pm2_5,
      Value<double>? pm10,
      Value<bool>? empty,
      Value<bool>? forecast,
      Value<String>? siteId,
      Value<Frequency>? frequency}) {
    return GraphInsightCompanion(
      time: time ?? this.time,
      pm2_5: pm2_5 ?? this.pm2_5,
      pm10: pm10 ?? this.pm10,
      empty: empty ?? this.empty,
      forecast: forecast ?? this.forecast,
      siteId: siteId ?? this.siteId,
      frequency: frequency ?? this.frequency,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (time.present) {
      map['time'] = Variable<DateTime>(time.value);
    }
    if (pm2_5.present) {
      map['pm2_5'] = Variable<double>(pm2_5.value);
    }
    if (pm10.present) {
      map['pm10'] = Variable<double>(pm10.value);
    }
    if (empty.present) {
      map['empty'] = Variable<bool>(empty.value);
    }
    if (forecast.present) {
      map['forecast'] = Variable<bool>(forecast.value);
    }
    if (siteId.present) {
      map['site_id'] = Variable<String>(siteId.value);
    }
    if (frequency.present) {
      final converter = $GraphInsightTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency.value));
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('GraphInsightCompanion(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('empty: $empty, ')
          ..write('forecast: $forecast, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }
}

class $GraphInsightTable extends GraphInsight
    with TableInfo<$GraphInsightTable, GraphInsightData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $GraphInsightTable(this.attachedDatabase, [this._alias]);
  final VerificationMeta _timeMeta = const VerificationMeta('time');
  @override
  late final GeneratedColumn<DateTime> time = GeneratedColumn<DateTime>(
      'time', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  final VerificationMeta _pm2_5Meta = const VerificationMeta('pm2_5');
  @override
  late final GeneratedColumn<double> pm2_5 = GeneratedColumn<double>(
      'pm2_5', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  final VerificationMeta _pm10Meta = const VerificationMeta('pm10');
  @override
  late final GeneratedColumn<double> pm10 = GeneratedColumn<double>(
      'pm10', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  final VerificationMeta _emptyMeta = const VerificationMeta('empty');
  @override
  late final GeneratedColumn<bool> empty = GeneratedColumn<bool>(
      'empty', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: 'CHECK ("empty" IN (0, 1))',
      defaultValue: const Constant(true));
  final VerificationMeta _forecastMeta = const VerificationMeta('forecast');
  @override
  late final GeneratedColumn<bool> forecast = GeneratedColumn<bool>(
      'forecast', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: 'CHECK ("forecast" IN (0, 1))',
      defaultValue: const Constant(false));
  final VerificationMeta _siteIdMeta = const VerificationMeta('siteId');
  @override
  late final GeneratedColumn<String> siteId = GeneratedColumn<String>(
      'site_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  final VerificationMeta _frequencyMeta = const VerificationMeta('frequency');
  @override
  late final GeneratedColumnWithTypeConverter<Frequency, int> frequency =
      GeneratedColumn<int>('frequency', aliasedName, false,
              type: DriftSqlType.int, requiredDuringInsert: true)
          .withConverter<Frequency>($GraphInsightTable.$converter0);
  @override
  List<GeneratedColumn> get $columns =>
      [time, pm2_5, pm10, empty, forecast, siteId, frequency];
  @override
  String get aliasedName => _alias ?? 'graph_insight';
  @override
  String get actualTableName => 'graph_insight';
  @override
  VerificationContext validateIntegrity(Insertable<GraphInsightData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('time')) {
      context.handle(
          _timeMeta, time.isAcceptableOrUnknown(data['time']!, _timeMeta));
    } else if (isInserting) {
      context.missing(_timeMeta);
    }
    if (data.containsKey('pm2_5')) {
      context.handle(
          _pm2_5Meta, pm2_5.isAcceptableOrUnknown(data['pm2_5']!, _pm2_5Meta));
    } else if (isInserting) {
      context.missing(_pm2_5Meta);
    }
    if (data.containsKey('pm10')) {
      context.handle(
          _pm10Meta, pm10.isAcceptableOrUnknown(data['pm10']!, _pm10Meta));
    } else if (isInserting) {
      context.missing(_pm10Meta);
    }
    if (data.containsKey('empty')) {
      context.handle(
          _emptyMeta, empty.isAcceptableOrUnknown(data['empty']!, _emptyMeta));
    }
    if (data.containsKey('forecast')) {
      context.handle(_forecastMeta,
          forecast.isAcceptableOrUnknown(data['forecast']!, _forecastMeta));
    }
    if (data.containsKey('site_id')) {
      context.handle(_siteIdMeta,
          siteId.isAcceptableOrUnknown(data['site_id']!, _siteIdMeta));
    } else if (isInserting) {
      context.missing(_siteIdMeta);
    }
    context.handle(_frequencyMeta, const VerificationResult.success());
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {siteId, frequency, time};
  @override
  GraphInsightData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return GraphInsightData(
      time: attachedDatabase.options.types
          .read(DriftSqlType.dateTime, data['${effectivePrefix}time'])!,
      pm2_5: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm2_5'])!,
      pm10: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm10'])!,
      empty: attachedDatabase.options.types
          .read(DriftSqlType.bool, data['${effectivePrefix}empty'])!,
      forecast: attachedDatabase.options.types
          .read(DriftSqlType.bool, data['${effectivePrefix}forecast'])!,
      siteId: attachedDatabase.options.types
          .read(DriftSqlType.string, data['${effectivePrefix}site_id'])!,
      frequency: $GraphInsightTable.$converter0.fromSql(attachedDatabase
          .options.types
          .read(DriftSqlType.int, data['${effectivePrefix}frequency'])!),
    );
  }

  @override
  $GraphInsightTable createAlias(String alias) {
    return $GraphInsightTable(attachedDatabase, alias);
  }

  static TypeConverter<Frequency, int> $converter0 =
      const EnumIndexConverter<Frequency>(Frequency.values);
}

abstract class _$AirQoDatabase extends GeneratedDatabase {
  _$AirQoDatabase(QueryExecutor e) : super(e);
  late final $GraphInsightTable graphInsight = $GraphInsightTable(this);
  @override
  Iterable<TableInfo<Table, dynamic>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [graphInsight];
}
