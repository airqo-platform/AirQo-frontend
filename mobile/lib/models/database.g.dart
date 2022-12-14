// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// **************************************************************************
// DriftDatabaseGenerator
// **************************************************************************

// ignore_for_file: type=lint
class HistoricalInsight extends DataClass
    implements Insertable<HistoricalInsight> {
  final DateTime time;
  final double pm2_5;
  final double pm10;
  final bool available;
  final String siteId;
  final Frequency frequency;
  const HistoricalInsight(
      {required this.time,
      required this.pm2_5,
      required this.pm10,
      required this.available,
      required this.siteId,
      required this.frequency});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['time'] = Variable<DateTime>(time);
    map['pm2_5'] = Variable<double>(pm2_5);
    map['pm10'] = Variable<double>(pm10);
    map['available'] = Variable<bool>(available);
    map['site_id'] = Variable<String>(siteId);
    {
      final converter = $HistoricalInsightsTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency));
    }
    return map;
  }

  HistoricalInsightsCompanion toCompanion(bool nullToAbsent) {
    return HistoricalInsightsCompanion(
      time: Value(time),
      pm2_5: Value(pm2_5),
      pm10: Value(pm10),
      available: Value(available),
      siteId: Value(siteId),
      frequency: Value(frequency),
    );
  }

  factory HistoricalInsight.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return HistoricalInsight(
      time: serializer.fromJson<DateTime>(json['time']),
      pm2_5: serializer.fromJson<double>(json['pm2_5']),
      pm10: serializer.fromJson<double>(json['pm10']),
      available: serializer.fromJson<bool>(json['available']),
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
      'available': serializer.toJson<bool>(available),
      'siteId': serializer.toJson<String>(siteId),
      'frequency': serializer.toJson<Frequency>(frequency),
    };
  }

  HistoricalInsight copyWith(
          {DateTime? time,
          double? pm2_5,
          double? pm10,
          bool? available,
          String? siteId,
          Frequency? frequency}) =>
      HistoricalInsight(
        time: time ?? this.time,
        pm2_5: pm2_5 ?? this.pm2_5,
        pm10: pm10 ?? this.pm10,
        available: available ?? this.available,
        siteId: siteId ?? this.siteId,
        frequency: frequency ?? this.frequency,
      );
  @override
  String toString() {
    return (StringBuffer('HistoricalInsight(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('available: $available, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(time, pm2_5, pm10, available, siteId, frequency);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is HistoricalInsight &&
          other.time == this.time &&
          other.pm2_5 == this.pm2_5 &&
          other.pm10 == this.pm10 &&
          other.available == this.available &&
          other.siteId == this.siteId &&
          other.frequency == this.frequency);
}

class HistoricalInsightsCompanion extends UpdateCompanion<HistoricalInsight> {
  final Value<DateTime> time;
  final Value<double> pm2_5;
  final Value<double> pm10;
  final Value<bool> available;
  final Value<String> siteId;
  final Value<Frequency> frequency;
  const HistoricalInsightsCompanion({
    this.time = const Value.absent(),
    this.pm2_5 = const Value.absent(),
    this.pm10 = const Value.absent(),
    this.available = const Value.absent(),
    this.siteId = const Value.absent(),
    this.frequency = const Value.absent(),
  });
  HistoricalInsightsCompanion.insert({
    required DateTime time,
    required double pm2_5,
    required double pm10,
    this.available = const Value.absent(),
    required String siteId,
    required Frequency frequency,
  })  : time = Value(time),
        pm2_5 = Value(pm2_5),
        pm10 = Value(pm10),
        siteId = Value(siteId),
        frequency = Value(frequency);
  static Insertable<HistoricalInsight> custom({
    Expression<DateTime>? time,
    Expression<double>? pm2_5,
    Expression<double>? pm10,
    Expression<bool>? available,
    Expression<String>? siteId,
    Expression<int>? frequency,
  }) {
    return RawValuesInsertable({
      if (time != null) 'time': time,
      if (pm2_5 != null) 'pm2_5': pm2_5,
      if (pm10 != null) 'pm10': pm10,
      if (available != null) 'available': available,
      if (siteId != null) 'site_id': siteId,
      if (frequency != null) 'frequency': frequency,
    });
  }

  HistoricalInsightsCompanion copyWith(
      {Value<DateTime>? time,
      Value<double>? pm2_5,
      Value<double>? pm10,
      Value<bool>? available,
      Value<String>? siteId,
      Value<Frequency>? frequency}) {
    return HistoricalInsightsCompanion(
      time: time ?? this.time,
      pm2_5: pm2_5 ?? this.pm2_5,
      pm10: pm10 ?? this.pm10,
      available: available ?? this.available,
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
    if (available.present) {
      map['available'] = Variable<bool>(available.value);
    }
    if (siteId.present) {
      map['site_id'] = Variable<String>(siteId.value);
    }
    if (frequency.present) {
      final converter = $HistoricalInsightsTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency.value));
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('HistoricalInsightsCompanion(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('available: $available, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }
}

class $HistoricalInsightsTable extends HistoricalInsights
    with TableInfo<$HistoricalInsightsTable, HistoricalInsight> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $HistoricalInsightsTable(this.attachedDatabase, [this._alias]);
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
  final VerificationMeta _availableMeta = const VerificationMeta('available');
  @override
  late final GeneratedColumn<bool> available = GeneratedColumn<bool>(
      'available', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: 'CHECK ("available" IN (0, 1))',
      defaultValue: const Constant(true));
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
          .withConverter<Frequency>($HistoricalInsightsTable.$converter0);
  @override
  List<GeneratedColumn> get $columns =>
      [time, pm2_5, pm10, available, siteId, frequency];
  @override
  String get aliasedName => _alias ?? 'historical_insights';
  @override
  String get actualTableName => 'historical_insights';
  @override
  VerificationContext validateIntegrity(Insertable<HistoricalInsight> instance,
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
    if (data.containsKey('available')) {
      context.handle(_availableMeta,
          available.isAcceptableOrUnknown(data['available']!, _availableMeta));
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
  HistoricalInsight map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return HistoricalInsight(
      time: attachedDatabase.options.types
          .read(DriftSqlType.dateTime, data['${effectivePrefix}time'])!,
      pm2_5: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm2_5'])!,
      pm10: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm10'])!,
      available: attachedDatabase.options.types
          .read(DriftSqlType.bool, data['${effectivePrefix}available'])!,
      siteId: attachedDatabase.options.types
          .read(DriftSqlType.string, data['${effectivePrefix}site_id'])!,
      frequency: $HistoricalInsightsTable.$converter0.fromSql(attachedDatabase
          .options.types
          .read(DriftSqlType.int, data['${effectivePrefix}frequency'])!),
    );
  }

  @override
  $HistoricalInsightsTable createAlias(String alias) {
    return $HistoricalInsightsTable(attachedDatabase, alias);
  }

  static TypeConverter<Frequency, int> $converter0 =
      const EnumIndexConverter<Frequency>(Frequency.values);
}

class ForecastInsight extends DataClass implements Insertable<ForecastInsight> {
  final DateTime time;
  final double pm2_5;
  final double pm10;
  final bool available;
  final String siteId;
  final Frequency frequency;
  const ForecastInsight(
      {required this.time,
      required this.pm2_5,
      required this.pm10,
      required this.available,
      required this.siteId,
      required this.frequency});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['time'] = Variable<DateTime>(time);
    map['pm2_5'] = Variable<double>(pm2_5);
    map['pm10'] = Variable<double>(pm10);
    map['available'] = Variable<bool>(available);
    map['site_id'] = Variable<String>(siteId);
    {
      final converter = $ForecastInsightsTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency));
    }
    return map;
  }

  ForecastInsightsCompanion toCompanion(bool nullToAbsent) {
    return ForecastInsightsCompanion(
      time: Value(time),
      pm2_5: Value(pm2_5),
      pm10: Value(pm10),
      available: Value(available),
      siteId: Value(siteId),
      frequency: Value(frequency),
    );
  }

  factory ForecastInsight.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ForecastInsight(
      time: serializer.fromJson<DateTime>(json['time']),
      pm2_5: serializer.fromJson<double>(json['pm2_5']),
      pm10: serializer.fromJson<double>(json['pm10']),
      available: serializer.fromJson<bool>(json['available']),
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
      'available': serializer.toJson<bool>(available),
      'siteId': serializer.toJson<String>(siteId),
      'frequency': serializer.toJson<Frequency>(frequency),
    };
  }

  ForecastInsight copyWith(
          {DateTime? time,
          double? pm2_5,
          double? pm10,
          bool? available,
          String? siteId,
          Frequency? frequency}) =>
      ForecastInsight(
        time: time ?? this.time,
        pm2_5: pm2_5 ?? this.pm2_5,
        pm10: pm10 ?? this.pm10,
        available: available ?? this.available,
        siteId: siteId ?? this.siteId,
        frequency: frequency ?? this.frequency,
      );
  @override
  String toString() {
    return (StringBuffer('ForecastInsight(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('available: $available, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(time, pm2_5, pm10, available, siteId, frequency);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ForecastInsight &&
          other.time == this.time &&
          other.pm2_5 == this.pm2_5 &&
          other.pm10 == this.pm10 &&
          other.available == this.available &&
          other.siteId == this.siteId &&
          other.frequency == this.frequency);
}

class ForecastInsightsCompanion extends UpdateCompanion<ForecastInsight> {
  final Value<DateTime> time;
  final Value<double> pm2_5;
  final Value<double> pm10;
  final Value<bool> available;
  final Value<String> siteId;
  final Value<Frequency> frequency;
  const ForecastInsightsCompanion({
    this.time = const Value.absent(),
    this.pm2_5 = const Value.absent(),
    this.pm10 = const Value.absent(),
    this.available = const Value.absent(),
    this.siteId = const Value.absent(),
    this.frequency = const Value.absent(),
  });
  ForecastInsightsCompanion.insert({
    required DateTime time,
    required double pm2_5,
    required double pm10,
    this.available = const Value.absent(),
    required String siteId,
    required Frequency frequency,
  })  : time = Value(time),
        pm2_5 = Value(pm2_5),
        pm10 = Value(pm10),
        siteId = Value(siteId),
        frequency = Value(frequency);
  static Insertable<ForecastInsight> custom({
    Expression<DateTime>? time,
    Expression<double>? pm2_5,
    Expression<double>? pm10,
    Expression<bool>? available,
    Expression<String>? siteId,
    Expression<int>? frequency,
  }) {
    return RawValuesInsertable({
      if (time != null) 'time': time,
      if (pm2_5 != null) 'pm2_5': pm2_5,
      if (pm10 != null) 'pm10': pm10,
      if (available != null) 'available': available,
      if (siteId != null) 'site_id': siteId,
      if (frequency != null) 'frequency': frequency,
    });
  }

  ForecastInsightsCompanion copyWith(
      {Value<DateTime>? time,
      Value<double>? pm2_5,
      Value<double>? pm10,
      Value<bool>? available,
      Value<String>? siteId,
      Value<Frequency>? frequency}) {
    return ForecastInsightsCompanion(
      time: time ?? this.time,
      pm2_5: pm2_5 ?? this.pm2_5,
      pm10: pm10 ?? this.pm10,
      available: available ?? this.available,
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
    if (available.present) {
      map['available'] = Variable<bool>(available.value);
    }
    if (siteId.present) {
      map['site_id'] = Variable<String>(siteId.value);
    }
    if (frequency.present) {
      final converter = $ForecastInsightsTable.$converter0;
      map['frequency'] = Variable<int>(converter.toSql(frequency.value));
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ForecastInsightsCompanion(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('pm10: $pm10, ')
          ..write('available: $available, ')
          ..write('siteId: $siteId, ')
          ..write('frequency: $frequency')
          ..write(')'))
        .toString();
  }
}

class $ForecastInsightsTable extends ForecastInsights
    with TableInfo<$ForecastInsightsTable, ForecastInsight> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ForecastInsightsTable(this.attachedDatabase, [this._alias]);
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
  final VerificationMeta _availableMeta = const VerificationMeta('available');
  @override
  late final GeneratedColumn<bool> available = GeneratedColumn<bool>(
      'available', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: 'CHECK ("available" IN (0, 1))',
      defaultValue: const Constant(true));
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
          .withConverter<Frequency>($ForecastInsightsTable.$converter0);
  @override
  List<GeneratedColumn> get $columns =>
      [time, pm2_5, pm10, available, siteId, frequency];
  @override
  String get aliasedName => _alias ?? 'forecast_insights';
  @override
  String get actualTableName => 'forecast_insights';
  @override
  VerificationContext validateIntegrity(Insertable<ForecastInsight> instance,
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
    if (data.containsKey('available')) {
      context.handle(_availableMeta,
          available.isAcceptableOrUnknown(data['available']!, _availableMeta));
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
  ForecastInsight map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ForecastInsight(
      time: attachedDatabase.options.types
          .read(DriftSqlType.dateTime, data['${effectivePrefix}time'])!,
      pm2_5: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm2_5'])!,
      pm10: attachedDatabase.options.types
          .read(DriftSqlType.double, data['${effectivePrefix}pm10'])!,
      available: attachedDatabase.options.types
          .read(DriftSqlType.bool, data['${effectivePrefix}available'])!,
      siteId: attachedDatabase.options.types
          .read(DriftSqlType.string, data['${effectivePrefix}site_id'])!,
      frequency: $ForecastInsightsTable.$converter0.fromSql(attachedDatabase
          .options.types
          .read(DriftSqlType.int, data['${effectivePrefix}frequency'])!),
    );
  }

  @override
  $ForecastInsightsTable createAlias(String alias) {
    return $ForecastInsightsTable(attachedDatabase, alias);
  }

  static TypeConverter<Frequency, int> $converter0 =
      const EnumIndexConverter<Frequency>(Frequency.values);
}

abstract class _$AirQoDatabase extends GeneratedDatabase {
  _$AirQoDatabase(QueryExecutor e) : super(e);
  late final $HistoricalInsightsTable historicalInsights =
      $HistoricalInsightsTable(this);
  late final $ForecastInsightsTable forecastInsights =
      $ForecastInsightsTable(this);
  @override
  Iterable<TableInfo<Table, dynamic>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [historicalInsights, forecastInsights];
  @override
  DriftDatabaseOptions get options =>
      const DriftDatabaseOptions(storeDateTimeAsText: true);
}
