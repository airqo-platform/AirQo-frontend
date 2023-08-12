part of 'insights_bloc.dart';

class InsightsState extends Equatable {
  const InsightsState(
    this.name, {
    this.insights = const [],
    this.selectedInsight,
  });

  InsightsState copyWith({
    Insight? selectedInsight,
    List<Insight>? insights,
  }) {
    return InsightsState(
      name,
      insights: insights ?? this.insights,
      selectedInsight: selectedInsight ?? this.selectedInsight,
    );
  }

  final Insight? selectedInsight;
  final String name;
  final List<Insight> insights;

  @override
  List<Object?> get props => [
        selectedInsight,
        insights.map((e) => e.pm2_5).toList(),
      ];
}
