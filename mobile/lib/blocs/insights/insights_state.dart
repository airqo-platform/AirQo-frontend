part of 'insights_bloc.dart';

enum InsightsStateStatus {
  loading,
  noData,
  ready;
}

class InsightsState extends Equatable {
  const InsightsState({
    this.insights = const [],
    this.selectedInsight,
    this.status = InsightsStateStatus.loading,
  });

  InsightsState copyWith({
    Insight? selectedInsight,
    List<Insight>? insights,
    InsightsStateStatus? status,
  }) {
    return InsightsState(
      insights: insights ?? this.insights,
      selectedInsight: selectedInsight ?? this.selectedInsight,
      status: status ?? this.status,
    );
  }

  final Insight? selectedInsight;
  final List<Insight> insights;
  final InsightsStateStatus status;

  @override
  List<Object?> get props => [
        status,
        selectedInsight,
        insights.map((e) => e.pm2_5).toList(),
      ];
}
