// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $ForecastTableTable extends ForecastTable
    with TableInfo<$ForecastTableTable, ForecastData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ForecastTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _timeMeta = const VerificationMeta('time');
  @override
  late final GeneratedColumn<DateTime> time = GeneratedColumn<DateTime>(
      'time', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _pm2_5Meta = const VerificationMeta('pm2_5');
  @override
  late final GeneratedColumn<double> pm2_5 = GeneratedColumn<double>(
      'pm2_5', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _siteIdMeta = const VerificationMeta('siteId');
  @override
  late final GeneratedColumn<String> siteId = GeneratedColumn<String>(
      'site_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [time, pm2_5, siteId];
  @override
  String get aliasedName => _alias ?? 'forecast_table';
  @override
  String get actualTableName => 'forecast_table';
  @override
  VerificationContext validateIntegrity(Insertable<ForecastData> instance,
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
    if (data.containsKey('site_id')) {
      context.handle(_siteIdMeta,
          siteId.isAcceptableOrUnknown(data['site_id']!, _siteIdMeta));
    } else if (isInserting) {
      context.missing(_siteIdMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {siteId, time};
  @override
  ForecastData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ForecastData(
      time: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}time'])!,
      pm2_5: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}pm2_5'])!,
      siteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}site_id'])!,
    );
  }

  @override
  $ForecastTableTable createAlias(String alias) {
    return $ForecastTableTable(attachedDatabase, alias);
  }
}

class ForecastData extends DataClass implements Insertable<ForecastData> {
  final DateTime time;
  final double pm2_5;
  final String siteId;
  const ForecastData(
      {required this.time, required this.pm2_5, required this.siteId});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['time'] = Variable<DateTime>(time);
    map['pm2_5'] = Variable<double>(pm2_5);
    map['site_id'] = Variable<String>(siteId);
    return map;
  }

  ForecastTableCompanion toCompanion(bool nullToAbsent) {
    return ForecastTableCompanion(
      time: Value(time),
      pm2_5: Value(pm2_5),
      siteId: Value(siteId),
    );
  }

  factory ForecastData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ForecastData(
      time: serializer.fromJson<DateTime>(json['time']),
      pm2_5: serializer.fromJson<double>(json['pm2_5']),
      siteId: serializer.fromJson<String>(json['siteId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'time': serializer.toJson<DateTime>(time),
      'pm2_5': serializer.toJson<double>(pm2_5),
      'siteId': serializer.toJson<String>(siteId),
    };
  }

  ForecastData copyWith({DateTime? time, double? pm2_5, String? siteId}) =>
      ForecastData(
        time: time ?? this.time,
        pm2_5: pm2_5 ?? this.pm2_5,
        siteId: siteId ?? this.siteId,
      );
  @override
  String toString() {
    return (StringBuffer('ForecastData(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('siteId: $siteId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(time, pm2_5, siteId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ForecastData &&
          other.time == this.time &&
          other.pm2_5 == this.pm2_5 &&
          other.siteId == this.siteId);
}

class ForecastTableCompanion extends UpdateCompanion<ForecastData> {
  final Value<DateTime> time;
  final Value<double> pm2_5;
  final Value<String> siteId;
  final Value<int> rowid;
  const ForecastTableCompanion({
    this.time = const Value.absent(),
    this.pm2_5 = const Value.absent(),
    this.siteId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ForecastTableCompanion.insert({
    required DateTime time,
    required double pm2_5,
    required String siteId,
    this.rowid = const Value.absent(),
  })  : time = Value(time),
        pm2_5 = Value(pm2_5),
        siteId = Value(siteId);
  static Insertable<ForecastData> custom({
    Expression<DateTime>? time,
    Expression<double>? pm2_5,
    Expression<String>? siteId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (time != null) 'time': time,
      if (pm2_5 != null) 'pm2_5': pm2_5,
      if (siteId != null) 'site_id': siteId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ForecastTableCompanion copyWith(
      {Value<DateTime>? time,
      Value<double>? pm2_5,
      Value<String>? siteId,
      Value<int>? rowid}) {
    return ForecastTableCompanion(
      time: time ?? this.time,
      pm2_5: pm2_5 ?? this.pm2_5,
      siteId: siteId ?? this.siteId,
      rowid: rowid ?? this.rowid,
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
    if (siteId.present) {
      map['site_id'] = Variable<String>(siteId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ForecastTableCompanion(')
          ..write('time: $time, ')
          ..write('pm2_5: $pm2_5, ')
          ..write('siteId: $siteId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AirQoDatabase extends GeneratedDatabase {
  _$AirQoDatabase(QueryExecutor e) : super(e);
  late final $ForecastTableTable forecastTable = $ForecastTableTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [forecastTable];
  @override
  DriftDatabaseOptions get options =>
      const DriftDatabaseOptions(storeDateTimeAsText: true);
}
