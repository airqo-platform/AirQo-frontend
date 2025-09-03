import 'package:equatable/equatable.dart';

enum ConsentType {
  locationTracking,
  surveyParticipation,
  alertResponses,
  dataSharing,
  researchCommunication,
}

enum ConsentStatus {
  notProvided,
  granted,
  withdrawn,
}

class ResearchConsent extends Equatable {
  final String userId;
  final Map<ConsentType, ConsentStatus> consentTypes;
  final DateTime? initialConsentDate;
  final DateTime lastUpdated;
  final String? withdrawalReason;
  final bool hasCompletedOnboarding;

  const ResearchConsent({
    required this.userId,
    required this.consentTypes,
    this.initialConsentDate,
    required this.lastUpdated,
    this.withdrawalReason,
    this.hasCompletedOnboarding = false,
  });

  @override
  List<Object?> get props => [
        userId,
        consentTypes,
        initialConsentDate,
        lastUpdated,
        withdrawalReason,
        hasCompletedOnboarding,
      ];

  factory ResearchConsent.initial(String userId) {
    return ResearchConsent(
      userId: userId,
      consentTypes: {
        for (ConsentType type in ConsentType.values)
          type: ConsentStatus.notProvided,
      },
      lastUpdated: DateTime.now(),
    );
  }

  bool hasGrantedConsent(ConsentType type) {
    return consentTypes[type] == ConsentStatus.granted;
  }

  bool isParticipatingInStudy() {
    return consentTypes.values.any(
      (status) => status == ConsentStatus.granted,
    );
  }

  List<ConsentType> getGrantedConsents() {
    return consentTypes.entries
        .where((entry) => entry.value == ConsentStatus.granted)
        .map((entry) => entry.key)
        .toList();
  }

  ResearchConsent updateConsent(ConsentType type, ConsentStatus status) {
    final newConsentTypes = Map<ConsentType, ConsentStatus>.from(consentTypes);
    newConsentTypes[type] = status;
    
    return copyWith(
      consentTypes: newConsentTypes,
      lastUpdated: DateTime.now(),
      initialConsentDate: initialConsentDate ?? 
        (status == ConsentStatus.granted ? DateTime.now() : null),
    );
  }

  ResearchConsent withdrawFromStudy(String reason) {
    final newConsentTypes = <ConsentType, ConsentStatus>{};
    for (ConsentType type in ConsentType.values) {
      newConsentTypes[type] = ConsentStatus.withdrawn;
    }
    
    return copyWith(
      consentTypes: newConsentTypes,
      withdrawalReason: reason,
      lastUpdated: DateTime.now(),
    );
  }

  ResearchConsent copyWith({
    String? userId,
    Map<ConsentType, ConsentStatus>? consentTypes,
    DateTime? initialConsentDate,
    DateTime? lastUpdated,
    String? withdrawalReason,
    bool? hasCompletedOnboarding,
  }) {
    return ResearchConsent(
      userId: userId ?? this.userId,
      consentTypes: consentTypes ?? this.consentTypes,
      initialConsentDate: initialConsentDate ?? this.initialConsentDate,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      withdrawalReason: withdrawalReason ?? this.withdrawalReason,
      hasCompletedOnboarding: hasCompletedOnboarding ?? this.hasCompletedOnboarding,
    );
  }

  factory ResearchConsent.fromJson(Map<String, dynamic> json) {
    final consentTypesJson = json['consentTypes'] as Map<String, dynamic>? ?? {};
    final consentTypes = <ConsentType, ConsentStatus>{};
    
    for (ConsentType type in ConsentType.values) {
      final typeString = type.toString().split('.').last;
      final statusString = consentTypesJson[typeString] as String?;
      
      if (statusString != null) {
        consentTypes[type] = ConsentStatus.values.firstWhere(
          (status) => status.toString().split('.').last == statusString,
          orElse: () => ConsentStatus.notProvided,
        );
      } else {
        consentTypes[type] = ConsentStatus.notProvided;
      }
    }

    return ResearchConsent(
      userId: json['userId'] ?? '',
      consentTypes: consentTypes,
      initialConsentDate: json['initialConsentDate'] != null
          ? DateTime.parse(json['initialConsentDate'])
          : null,
      lastUpdated: DateTime.parse(json['lastUpdated'] ?? DateTime.now().toIso8601String()),
      withdrawalReason: json['withdrawalReason'],
      hasCompletedOnboarding: json['hasCompletedOnboarding'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    final consentTypesJson = <String, String>{};
    consentTypes.forEach((type, status) {
      consentTypesJson[type.toString().split('.').last] = 
          status.toString().split('.').last;
    });

    return {
      'userId': userId,
      'consentTypes': consentTypesJson,
      if (initialConsentDate != null)
        'initialConsentDate': initialConsentDate!.toIso8601String(),
      'lastUpdated': lastUpdated.toIso8601String(),
      if (withdrawalReason != null) 'withdrawalReason': withdrawalReason,
      'hasCompletedOnboarding': hasCompletedOnboarding,
    };
  }
}

extension ConsentTypeExtension on ConsentType {
  String get displayName {
    switch (this) {
      case ConsentType.locationTracking:
        return 'Location Tracking';
      case ConsentType.surveyParticipation:
        return 'Survey Participation';
      case ConsentType.alertResponses:
        return 'Alert Response Tracking';
      case ConsentType.dataSharing:
        return 'Anonymous Data Sharing';
      case ConsentType.researchCommunication:
        return 'Research Updates';
    }
  }

  String get description {
    switch (this) {
      case ConsentType.locationTracking:
        return 'Allow collection of your location data for pollution exposure analysis';
      case ConsentType.surveyParticipation:
        return 'Participate in research surveys about air quality and behavior';
      case ConsentType.alertResponses:
        return 'Track your responses to air quality alerts for behavior research';
      case ConsentType.dataSharing:
        return 'Share anonymous data with researchers studying air quality';
      case ConsentType.researchCommunication:
        return 'Receive updates about research findings and study progress';
    }
  }

  String get dataExample {
    switch (this) {
      case ConsentType.locationTracking:
        return 'Your daily routes, time spent in different pollution zones, movement patterns';
      case ConsentType.surveyParticipation:
        return 'Weekly health surveys, behavior change questionnaires, feedback forms';
      case ConsentType.alertResponses:
        return 'Whether you followed alert advice, reasons for your choices, barriers faced';
      case ConsentType.dataSharing:
        return 'Anonymized patterns shared with universities for research publications';
      case ConsentType.researchCommunication:
        return 'Monthly study updates, preliminary findings, final results summary';
    }
  }
}