import 'package:equatable/equatable.dart';
import 'package:loggy/loggy.dart';

/// Model for a site location
class SelectedSite extends Equatable {
  final String id;
  final String name;
  final String? searchName;
  final double? latitude;
  final double? longitude;

  const SelectedSite({
    required this.id,
    required this.name,
    this.searchName,
    this.latitude,
    this.longitude,
  });

  @override
  List<Object?> get props => [id, name, searchName, latitude, longitude];

  factory SelectedSite.fromJson(Map<String, dynamic> json) {
    // Extract the ID field, handling both "_id" and "id" keys
    final String id = json['_id'] ?? json['id'] ?? '';
    
    return SelectedSite(
      id: id,
      name: json['name'] ?? 'Unknown Location',
      searchName: json['search_name'] ?? json['searchName'],
      latitude: _parseDouble(json['latitude']),
      longitude: _parseDouble(json['longitude']),
    );
  }

  // Helper method to safely parse doubles
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

/// Model for user preferences including selected locations
class UserPreferencesModel extends Equatable with UiLoggy {
  final String id;
  final String userId;
  final List<SelectedSite> selectedSites;

  const UserPreferencesModel({
    required this.id,
    required this.userId,
    required this.selectedSites,
  });

  @override
  List<Object> get props => [id, userId, selectedSites];

  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) {
    final logger = Loggy('UserPreferencesModel');
    logger.info('Parsing UserPreferencesModel from JSON');
    logger.info('JSON keys: ${json.keys.toList()}');
    
    // Handle nested preference structure
    final preference = json['preference'] ?? json;
    
    // Extract ID
    final String id = preference['_id'] ?? preference['id'] ?? '';
    logger.info('Found preference ID: $id');
    
    // Extract user ID
    final String userId = preference['user_id'] ?? '';
    logger.info('Found user ID: $userId');
    
    // Extract selected sites with better error handling
    List<SelectedSite> sites = [];
    try {
      final selectedSitesRaw = preference['selected_sites'];
      
      if (selectedSitesRaw != null && selectedSitesRaw is List) {
        logger.info('Found ${selectedSitesRaw.length} selected sites');
        
        sites = selectedSitesRaw
            .map((site) => site is Map<String, dynamic> ? SelectedSite.fromJson(site) : null)
            .where((site) => site != null)
            .cast<SelectedSite>()
            .toList();
        
        logger.info('Successfully parsed ${sites.length} site models');
      } else {
        logger.warning('No selected_sites found or invalid format: $selectedSitesRaw');
      }
    } catch (e) {
      logger.error('Error parsing selected sites: $e');
    }
    
    return UserPreferencesModel(
      id: id,
      userId: userId,
      selectedSites: sites,
    );
  }
}