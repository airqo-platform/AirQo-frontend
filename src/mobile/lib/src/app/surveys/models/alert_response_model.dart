import 'package:equatable/equatable.dart';

enum AlertResponseType {
  followed,
  notFollowed,
  dismissed,
}

enum FollowedReason {
  stayedIndoors,
  changedPlans,
  woreMask,
  reducedOutdoorActivity,
  closedWindows,
  other,
}

enum NotFollowedReason {
  hadToGoOut,
  noAlternative,
  tooInconvenient,
  didntBelieveAlert,
  alreadyIndoors,
  lackResources,
  other,
}

class AlertResponse extends Equatable {
  final String id;
  final String alertId;
  final String userId;
  final AlertResponseType responseType;
  final FollowedReason? followedReason;
  final NotFollowedReason? notFollowedReason;
  final String? customReason;
  final DateTime respondedAt;
  final Map<String, dynamic>? alertContext;

  const AlertResponse({
    required this.id,
    required this.alertId,
    required this.userId,
    required this.responseType,
    this.followedReason,
    this.notFollowedReason,
    this.customReason,
    required this.respondedAt,
    this.alertContext,
  });

  @override
  List<Object?> get props => [
        id,
        alertId,
        userId,
        responseType,
        followedReason,
        notFollowedReason,
        customReason,
        respondedAt,
        alertContext,
      ];

  factory AlertResponse.fromJson(Map<String, dynamic> json) {
    return AlertResponse(
      id: json['id'] ?? '',
      alertId: json['alertId'] ?? '',
      userId: json['userId'] ?? '',
      responseType: AlertResponseType.values.firstWhere(
        (e) => e.toString().split('.').last == json['responseType'],
        orElse: () => AlertResponseType.dismissed,
      ),
      followedReason: json['followedReason'] != null
          ? FollowedReason.values.firstWhere(
              (e) => e.toString().split('.').last == json['followedReason'],
              orElse: () => FollowedReason.other,
            )
          : null,
      notFollowedReason: json['notFollowedReason'] != null
          ? NotFollowedReason.values.firstWhere(
              (e) => e.toString().split('.').last == json['notFollowedReason'],
              orElse: () => NotFollowedReason.other,
            )
          : null,
      customReason: json['customReason'],
      respondedAt: DateTime.parse(json['respondedAt']),
      alertContext: json['alertContext'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'alertId': alertId,
      'userId': userId,
      'responseType': responseType.toString().split('.').last,
      if (followedReason != null)
        'followedReason': followedReason!.toString().split('.').last,
      if (notFollowedReason != null)
        'notFollowedReason': notFollowedReason!.toString().split('.').last,
      if (customReason != null) 'customReason': customReason,
      'respondedAt': respondedAt.toIso8601String(),
      if (alertContext != null) 'alertContext': alertContext,
    };
  }

  AlertResponse copyWith({
    String? id,
    String? alertId,
    String? userId,
    AlertResponseType? responseType,
    FollowedReason? followedReason,
    NotFollowedReason? notFollowedReason,
    String? customReason,
    DateTime? respondedAt,
    Map<String, dynamic>? alertContext,
  }) {
    return AlertResponse(
      id: id ?? this.id,
      alertId: alertId ?? this.alertId,
      userId: userId ?? this.userId,
      responseType: responseType ?? this.responseType,
      followedReason: followedReason ?? this.followedReason,
      notFollowedReason: notFollowedReason ?? this.notFollowedReason,
      customReason: customReason ?? this.customReason,
      respondedAt: respondedAt ?? this.respondedAt,
      alertContext: alertContext ?? this.alertContext,
    );
  }
}

extension FollowedReasonExtension on FollowedReason {
  String get displayText {
    switch (this) {
      case FollowedReason.stayedIndoors:
        return 'Stayed indoors';
      case FollowedReason.changedPlans:
        return 'Changed outdoor plans';
      case FollowedReason.woreMask:
        return 'Wore a mask';
      case FollowedReason.reducedOutdoorActivity:
        return 'Reduced outdoor activity';
      case FollowedReason.closedWindows:
        return 'Closed windows';
      case FollowedReason.other:
        return 'Other';
    }
  }
}

extension NotFollowedReasonExtension on NotFollowedReason {
  String get displayText {
    switch (this) {
      case NotFollowedReason.hadToGoOut:
        return 'Had to go out';
      case NotFollowedReason.noAlternative:
        return 'No alternative available';
      case NotFollowedReason.tooInconvenient:
        return 'Too inconvenient';
      case NotFollowedReason.didntBelieveAlert:
        return 'Didn\'t believe the alert';
      case NotFollowedReason.alreadyIndoors:
        return 'Already indoors';
      case NotFollowedReason.lackResources:
        return 'Lack resources (mask, etc.)';
      case NotFollowedReason.other:
        return 'Other';
    }
  }
}