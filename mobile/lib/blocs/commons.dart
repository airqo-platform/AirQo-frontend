import 'package:app/models/models.dart';
import 'package:equatable/equatable.dart';

abstract class InsightsEvent extends Equatable {
  const InsightsEvent();
}

class LoadInsights extends InsightsEvent {
  const LoadInsights({
    this.siteId,
    this.airQualityReading,
  });
  final String? siteId;
  final AirQualityReading? airQualityReading;

  @override
  List<Object?> get props => [siteId, airQualityReading];
}

class RefreshInsights extends InsightsEvent {
  const RefreshInsights();

  @override
  List<Object?> get props => [];
}

class SwitchInsightsPollutant extends InsightsEvent {
  const SwitchInsightsPollutant(this.pollutant);
  final Pollutant pollutant;

  @override
  List<Object?> get props => [pollutant];
}

class UpdateInsightsActiveIndex extends InsightsEvent {
  const UpdateInsightsActiveIndex(this.index);
  final int index;

  @override
  List<Object?> get props => [index];
}

class UpdateSelectedInsight extends InsightsEvent {
  const UpdateSelectedInsight(this.selectedInsight);
  final Insights selectedInsight;

  @override
  List<Object?> get props => [selectedInsight];
}

class ClearInsightsTab extends InsightsEvent {
  const ClearInsightsTab();

  @override
  List<Object?> get props => [];
}
