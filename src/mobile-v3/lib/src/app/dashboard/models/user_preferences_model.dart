

class SelectedSite {
  final String id;
  final String name;
  final String searchName;
  final double? latitude;
  final double? longitude;
  
  SelectedSite({
    required this.id,
    required this.name,
    required this.searchName,
    this.latitude,
    this.longitude,
  });
  
  factory SelectedSite.fromJson(Map<String, dynamic> json) {
    return SelectedSite(
      id: json['_id'] ?? '',
      name: json['name'] ?? 'Unknown',
      searchName: json['search_name'] ?? 'Unknown',
      latitude: json['latitude'],
      longitude: json['longitude'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'search_name': searchName,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}

class UserPreferencesModel {
  final String userId;
  final List<SelectedSite> selectedSites;
  final String? pollutant;
  final String? frequency;
  
  UserPreferencesModel({
    required this.userId,
    required this.selectedSites,
    this.pollutant,
    this.frequency,
  });
  
  factory UserPreferencesModel.fromJson(Map<String, dynamic> json) {
    List<SelectedSite> sites = [];
    if (json['selected_sites'] != null) {
      sites = (json['selected_sites'] as List)
          .map((site) => SelectedSite.fromJson(site))
          .toList();
    }
    
    return UserPreferencesModel(
      userId: json['user_id'] ?? '',
      selectedSites: sites,
      pollutant: json['pollutant'],
      frequency: json['frequency'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'selected_sites': selectedSites.map((site) => site.toJson()).toList(),
      'pollutant': pollutant,
      'frequency': frequency,
    };
  }
}