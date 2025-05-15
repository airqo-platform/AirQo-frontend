import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

class SelectedSite extends Equatable {
  final String id;
  final String name;
  final String searchName;
  final double? latitude;
  final double? longitude;

  const SelectedSite({
    required this.id,
    required this.name,
    required this.searchName,
    this.latitude,
    this.longitude,
  });

  @override
  List<Object?> get props => [id, name, searchName, latitude, longitude];

  factory SelectedSite.fromJson(Map<String, dynamic> json) {
    final String id = json['_id'] ?? '';
    
    final String name = json['name'] ?? 'Unknown Location';
    final String searchName = json['search_name'] ?? json['searchName'] ?? name;

    return SelectedSite(
      id: id,
      name: name,
      searchName: searchName,
      latitude: _parseDouble(json['latitude']),
      longitude: _parseDouble(json['longitude']),
    );
  }

  /// Convert to JSON for API requests
  Map<String, dynamic> toJson() {
    return {
      "_id": id,
      "name": name,
      "search_name": searchName,
      if (latitude != null) "latitude": latitude,
      if (longitude != null) "longitude": longitude,
    };
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) {
      try {
        return double.parse(value);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

class UserPreferencesModel extends Equatable with UiLoggy {
  final String id;
  final String userId;
  final List<SelectedSite> selectedSites;

  final String? pollutant;
  final String? frequency;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? chartType;
  final String? chartTitle;
  final String? chartSubTitle;
  final String? airqloudId;
  final String? gridId;
  final String? cohortId;
  final String? networkId;
  final String? groupId;
  final List<String>? siteIds;
  final List<String>? deviceIds;
  final PeriodModel? period;

  const UserPreferencesModel({
    required this.id,
    required this.userId,
    required this.selectedSites,
    this.pollutant,
    this.frequency,
    this.startDate,
    this.endDate,
    this.chartType,
    this.chartTitle,
    this.chartSubTitle,
    this.airqloudId,
    this.gridId,
    this.cohortId,
    this.networkId,
    this.groupId,
    this.siteIds,
    this.deviceIds,
    this.period,
  });

  @override
  List<Object?> get props => [
        id,
        userId,
        selectedSites,
        pollutant,
        frequency,
        startDate,
        endDate,
        chartType,
        chartTitle,
        chartSubTitle,
        airqloudId,
        gridId,
        cohortId,
        networkId,
        groupId,
        siteIds,
        deviceIds,
        period,
      ];

  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) {
    final logger = Loggy('UserPreferencesModel');
    logger.info('Parsing UserPreferencesModel from JSON');
    logger.info('JSON keys: ${json.keys.toList()}');

    final String id = json['_id'] ?? '';

    final String userId = json['user_id'] ?? '';

    List<SelectedSite> sites = [];
    try {
      final selectedSitesRaw =
          json['selected_sites'] ?? json['selectedSites'] ?? [];

      if (selectedSitesRaw is List) {
        logger
            .info('Found ${selectedSitesRaw.length} potential selected sites');

        sites = selectedSitesRaw
            .where((site) => site is Map<String, dynamic>)
            .map((site) => SelectedSite.fromJson(site))
            .toList();

        logger.info('Successfully parsed ${sites.length} site models');
      } else {
        logger.warning(
            'No selected_sites found or invalid format: $selectedSitesRaw');
      }
    } catch (e) {
      logger.error('Error parsing selected sites: $e');
    }

    DateTime? startDate;
    DateTime? endDate;
    try {
      if (json['startDate'] != null) {
        startDate = DateTime.parse(json['startDate']);
      }
      if (json['endDate'] != null) {
        endDate = DateTime.parse(json['endDate']);
      }
    } catch (e) {
      logger.warning('Error parsing dates: $e');
    }

    // Parse period if present
    PeriodModel? period;
    if (json['period'] is Map<String, dynamic>) {
      try {
        period = PeriodModel.fromJson(json['period']);
      } catch (e) {
        logger.warning('Error parsing period: $e');
      }
    }

    List<String>? siteIds;
    List<String>? deviceIds;
    
    if (json['site_ids'] is List) {
      siteIds = List<String>.from(json['site_ids']);
    }
    
    if (json['device_ids'] is List) {
      deviceIds = List<String>.from(json['device_ids']);
    }

    return UserPreferencesModel(
      id: id,
      userId: userId,
      selectedSites: sites,
      pollutant: json['pollutant'],
      frequency: json['frequency'],
      startDate: startDate,
      endDate: endDate,
      chartType: json['chartType'],
      chartTitle: json['chartTitle'],
      chartSubTitle: json['chartSubTitle'],
      airqloudId: json['airqloud_id'],
      gridId: json['grid_id'],
      cohortId: json['cohort_id'],
      networkId: json['network_id'],
      groupId: json['group_id'],
      siteIds: siteIds,
      deviceIds: deviceIds,
      period: period,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "user_id": userId,
      "selected_sites": selectedSites.map((site) => site.toJson()).toList(),
      if (pollutant != null) "pollutant": pollutant,
      if (frequency != null) "frequency": frequency,
      if (startDate != null) "startDate": startDate!.toIso8601String(),
      if (endDate != null) "endDate": endDate!.toIso8601String(),
      if (chartType != null) "chartType": chartType,
      if (chartTitle != null) "chartTitle": chartTitle,
      if (chartSubTitle != null) "chartSubTitle": chartSubTitle,
      if (airqloudId != null) "airqloud_id": airqloudId,
      if (gridId != null) "grid_id": gridId,
      if (cohortId != null) "cohort_id": cohortId,
      if (networkId != null) "network_id": networkId,
      if (groupId != null) "group_id": groupId,
      if (siteIds != null) "site_ids": siteIds,
      if (deviceIds != null) "device_ids": deviceIds,
      if (period != null) "period": period!.toJson(),
    };
  }
}

class PeriodModel extends Equatable {
  final String value;
  final String label;
  final num unitValue;
  final String unit;

  const PeriodModel({
    required this.value,
    required this.label,
    required this.unitValue,
    required this.unit,
  });

  @override
  List<Object> get props => [value, label, unitValue, unit];

  factory PeriodModel.fromJson(Map<String, dynamic> json) {
    return PeriodModel(
      value: json['value'] ?? '',
      label: json['label'] ?? '',
      unitValue: json['unitValue'] ?? 0,
      unit: json['unit'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "value": value,
      "label": label,
      "unitValue": unitValue,
      "unit": unit,
    };
  }
}